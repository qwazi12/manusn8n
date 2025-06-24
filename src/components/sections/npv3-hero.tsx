"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import HeroVideoDialog from "@/components/magicui/hero-video";

export default function NPV3Hero() {
  return (
    <section className="relative">
      <div className="relative flex w-full flex-col items-center justify-start px-4 pt-32 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
        {/* Announcement Pill */}
        <Link href="/blog" className="flex w-auto items-center space-x-2 rounded-full bg-primary/20 px-2 py-1 ring-1 ring-accent whitespace-pre mb-8 hover:bg-primary/30 transition-colors">
          <div className="w-fit rounded-full bg-accent px-2 py-0.5 text-center text-xs font-medium text-primary sm:text-sm">
            📣 Announcement
          </div>
          <p className="text-xs font-medium text-primary sm:text-sm">
            Introducing NodePilot
          </p>
        </Link>

        {/* Main Heading */}
        <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
          <h1 className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="inline-block px-1 md:px-2 text-balance font-semibold">
              Generate
            </span>
            <span className="inline-block px-1 md:px-2 text-balance font-semibold">
              n8n
            </span>
            <span className="inline-block px-1 md:px-2 text-balance font-semibold">
              workflows
            </span>
            <span className="inline-block px-1 md:px-2 text-balance font-semibold">
              with
            </span>
            <span className="inline-block px-1 md:px-2 text-balance font-semibold text-primary">
              AI
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-center text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-9 text-balance">
            Transform your automation ideas into ready-to-use n8n workflows through natural language. No complex node configuration required.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <SignedIn>
            <Button asChild size="lg" className="w-full sm:w-auto text-background flex gap-2">
              <Link href="/dashboard">
                <Icons.sparkles className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="w-full sm:w-auto text-background flex gap-2">
                <Icons.sparkles className="h-4 w-4" />
                Start Here
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Hero Video */}
        <div className="relative mx-auto flex w-full items-center justify-center">
          <HeroVideoDialog
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="/dashboard.png"
            thumbnailAlt="NodePilot Dashboard Preview"
            className="border rounded-lg shadow-lg max-w-screen-lg mt-16"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-1/3 bg-gradient-to-t from-background via-background to-transparent lg:h-1/4"></div>
      </div>
    </section>
  );
}
