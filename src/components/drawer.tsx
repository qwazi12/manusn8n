"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Icons } from "@/components/icons";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Drawer() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6 p-6">
        <div className="flex items-center space-x-2">
          <Icons.logo className="w-auto h-[32px]" />
          <span className="font-bold text-lg">NodePilot</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <Button 
              key={index} 
              variant="ghost" 
              asChild 
              className="justify-start"
            >
              <Link 
                href={item.href} 
                onClick={() => setIsOpen(false)}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="flex flex-col gap-2 mt-auto">
          <SignedIn>
            <Button variant="default" asChild onClick={() => setIsOpen(false)}>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <div className="flex justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </SignInButton>
            <Button asChild className="w-full">
              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                <Icons.sparkles className="h-4 w-4 mr-2" />
                Get Started Free
              </Link>
            </Button>
          </SignedOut>
        </div>
      </SheetContent>
    </Sheet>
  );
}
