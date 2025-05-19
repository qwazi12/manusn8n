import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/dashboard/create", "/dashboard/workflows"];

export async function middleware(req: NextRequest) {
  const { userId } = await auth();

  // Skip if not signed in or not a protected route
  if (!userId || !protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const user = await clerkClient.users.getUser(userId);
  const plan = user.privateMetadata?.plan || user.publicMetadata?.plan;
  const trialStartStr = user.publicMetadata?.trialStart;

  // If no trialStart, let them in
  if (!trialStartStr || typeof trialStartStr !== 'string') return NextResponse.next();

  const trialStart = new Date(trialStartStr);
  const now = new Date();
  const diffInMs = now.getTime() - trialStart.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  const isTrialExpired = plan === "free_user" && diffInDays > 7;

  if (isTrialExpired) {
    const pricingUrl = new URL("/pricing", req.url);
    return NextResponse.redirect(pricingUrl);
  }

  return NextResponse.next();
} 