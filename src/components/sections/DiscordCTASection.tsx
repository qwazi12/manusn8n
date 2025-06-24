"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import BlurFade from "@/components/magicui/blur-fade";
import { MessageSquare, Users, Zap } from "lucide-react";
import Link from "next/link";

export function DiscordCTASection() {
  return (
    <section className="container mx-auto py-16 md:py-24">
      <BlurFade delay={0.2}>
        <Card className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <BorderBeam
            size={250}
            duration={12}
            delay={0}
            borderWidth={1.5}
            colorFrom="hsl(var(--primary))"
            colorTo="hsl(var(--primary)/0)"
            className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="px-6 py-12 sm:px-12 lg:px-16 relative">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Join Our Community
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-lg leading-relaxed">
                Connect with fellow automation enthusiasts, share workflows, and get help from our community.
                Join our Discord server to stay up to date with the latest features and updates.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>1,000+ Members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Active Support</span>
                </div>
              </div>

              <Button
                size="lg"
                asChild
                className="mt-6 text-background hover:scale-105 transition-transform duration-200"
              >
                <Link
                  href="https://discord.gg/FJDnUQjP"
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
      </BlurFade>
    </section>
  );
}
