import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DiscordCTASection() {
  return (
    <section className="container mx-auto py-16 md:py-24">
      <div className="bg-muted/40 border rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Ready to join this{" "}
              <span className="text-primary">Community?</span>
            </h3>
            <p className="text-lg text-muted-foreground">
              Join our vibrant Discord community! Connect, share, and grow with like-minded enthusiasts. Click to dive in!
            </p>
          </div>
        </div>
        <Button size="lg" asChild className="ml-auto">
          <Link
            href="https://discord.gg/BFnVZ9D4aG"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap"
          >
            Join Discord
          </Link>
        </Button>
      </div>
    </section>
  );
}
