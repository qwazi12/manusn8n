import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function HeroSection() {
  return (
    <section className="container mx-auto py-12 md:py-20 relative">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6">
          <span className="text-primary font-medium">New AI-Powered Automation</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-3xl mx-auto">
          Do Generate Workflows Instantly{" "}
          <span className="text-primary">AI-Driven n8n Scripts</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Leverage the power of AI to create, optimize, and manage your n8n automation
          workflows effortlessly. Join our community and transform your productivity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <SignedIn>
            <Button asChild size="lg">
              <Link href="/dashboard">Start Automating</Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg">Start Automating</Button>
            </SignInButton>
          </SignedOut>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://discord.gg/VNHHPQap" target="_blank" rel="noopener noreferrer">
              Join the Community
            </Link>
          </Button>
        </div>

        <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden border shadow-xl">
          <Image
            src="/dashboard.png"
            alt="Dashboard preview"
            width={800}
            height={450}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}
