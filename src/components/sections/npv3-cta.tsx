import { Icons } from "@/components/icons";
import Section from "@/components/section";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function NPV3CTA() {
  return (
    <Section
      id="cta"
      title="Ready to get started?"
      subtitle="Start your free trial today."
    >
      <div className="flex flex-col w-full sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
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
              Get started for free
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </Section>
  );
}
