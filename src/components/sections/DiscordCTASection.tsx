import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export function DiscordCTASection() {
  return (
    <section className="container mx-auto py-16 md:py-24">
      <Card className="bg-primary/5 border-primary/20">
        <div className="px-6 py-12 sm:px-12 lg:px-16">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Join Our Community
            </h2>
            <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
              Connect with fellow automation enthusiasts, share workflows, and get help from our community.
              Join our Discord server to stay up to date with the latest features and updates.
            </p>
            <Button
              size="lg"
              asChild
            >
              <Link
                href="https://discord.gg/VNHHPQap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Join Discord Server
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
