"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}