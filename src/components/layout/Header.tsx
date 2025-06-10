"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border z-40 rounded-2xl flex justify-between items-center p-2 bg-card shadow-md">
      <Link href="/" className="font-bold text-lg flex items-center">
        NodePilot
      </Link>

      {/* Mobile Menu */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" asChild>
                <Link href="/#features" onClick={() => setIsOpen(false)}>Features</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/#contact" onClick={() => setIsOpen(false)}>Contact</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/#faq" onClick={() => setIsOpen(false)}>FAQ</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/blog" onClick={() => setIsOpen(false)}>Blog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <SignedIn>
                <Button variant="default" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline">Login</Button>
                </SignInButton>
                <Button asChild>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up Now</Link>
                </Button>
              </SignedOut>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-1">
        <Button variant="ghost" asChild>
          <Link href="/#features">Features</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/pricing">Pricing</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/#contact">Contact</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/#faq">FAQ</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/blog">Blog</Link>
        </Button>
      </div>

      <div className="hidden lg:flex gap-3 items-center">
        <SignedIn>
          <Button variant="default" asChild className="h-10 md:h-[34px]">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline" className="h-10 md:h-[34px]">Login</Button>
          </SignInButton>
          <Button asChild className="h-10 md:h-[34px]">
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}
