"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import BlurFade from "@/components/magicui/blur-fade";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

interface PricingTierProps {
  name: string;
  description: string;
  price: string;
  priceDetail: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  popular?: boolean;
}

function PricingTier({
  name,
  description,
  price,
  priceDetail,
  features,
  buttonText,
  buttonLink,
  popular,
}: PricingTierProps) {
  return (
    <Card className={`relative border ${popular ? 'border-primary/50 shadow-lg scale-105' : 'border-border'} flex flex-col h-full bg-card/50 hover:bg-card/80 transition-all duration-300 group`}>
      {popular && (
        <>
          <BorderBeam
            size={250}
            duration={12}
            delay={0}
            borderWidth={1.5}
            colorFrom="hsl(var(--primary))"
            colorTo="hsl(var(--primary)/0)"
          />
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
              <Star className="h-3 w-3 flex-shrink-0" />
              Most Popular
            </div>
          </div>
        </>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6 text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground ml-2">{priceDetail}</span>
          </div>
        </div>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={`${name}-${feature}`} className="flex items-start">
              <Check className="mr-3 h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <SignedIn>
          <Button
            className={`w-full ${popular ? 'bg-primary hover:bg-primary/90' : ''}`}
            variant={popular ? 'default' : 'outline'}
            asChild
          >
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              className={`w-full ${popular ? 'bg-primary hover:bg-primary/90' : ''}`}
              variant={popular ? 'default' : 'outline'}
            >
              {buttonText}
            </Button>
          </SignInButton>
        </SignedOut>
      </CardFooter>
    </Card>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto py-16 md:py-24">
      <BlurFade delay={0.2}>
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-primary mb-2">Pricing</h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your automation needs. All plans include best-in-class AI workflow generation and step-by-step guidance.
          </p>
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <BlurFade delay={0.3}>
          <PricingTier
            name="Free Trial"
            description="Perfect for getting started"
            price="$0"
            priceDetail="/trial"
            features={[
              "25 credits included",
              "Natural language → n8n JSON workflow generation",
              "Step-by-step guide with each workflow",
              "Basic support via documentation",
              "7-day trial period"
            ]}
            buttonText="Start Free Trial"
            buttonLink="/dashboard"
          />
        </BlurFade>

        <BlurFade delay={0.4}>
          <PricingTier
            name="Starter Plan"
            description="For individuals and small projects"
            price="$14"
            priceDetail="/month"
            features={[
              "300 credits/month",
              "All Free Trial features",
              "Email support",
              "Workflow history",
              "Basic templates library",
              "Export workflows to n8n"
            ]}
            buttonText="Choose Starter"
            buttonLink="/dashboard"
          />
        </BlurFade>

        <BlurFade delay={0.5}>
          <PricingTier
            name="Pro Plan"
            description="For power users and growing teams"
            price="$21"
            priceDetail="/month"
            features={[
              "500 credits/month",
              "All Starter features",
              "Priority AI processing",
              "Upload files/images for smarter prompts",
              "Retain workflows",
              "Multi-turn refinement chat",
              "Priority support",
              "Advanced templates library"
            ]}
            buttonText="Upgrade to Pro"
            buttonLink="/dashboard"
            popular
          />
        </BlurFade>

        <BlurFade delay={0.6}>
          <PricingTier
            name="Pay-As-You-Go"
            description="Great for occasional users"
            price="$8"
            priceDetail="per 100 credits"
            features={[
              "No subscription required",
              "All standard generation features",
              "Credits expire after 30 days",
              "Flexible usage",
              "Perfect for testing or sporadic use"
            ]}
            buttonText="Buy Credits"
            buttonLink="/dashboard"
          />
        </BlurFade>
      </div>
    </section>
  );
}
