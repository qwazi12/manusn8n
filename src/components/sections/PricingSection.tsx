import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react";
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
    <Card className={`border ${popular ? 'border-primary/50 shadow-lg' : ''} flex flex-col h-full`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{price}</span>
            <span className="text-muted-foreground ml-2">{priceDetail}</span>
          </div>
        </div>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={`${name}-${feature}`} className="flex items-start">
              <Check className="mr-2 h-4 w-4 text-primary mt-1" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <SignedIn>
          <Button
            className="w-full"
            asChild
          >
            <Link href={buttonLink}>{buttonText}</Link>
          </Button>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="w-full">{buttonText}</Button>
          </SignInButton>
        </SignedOut>
      </CardFooter>
    </Card>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-lg font-medium text-muted-foreground mb-2">Pricing</h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-4">NodePilot Pricing System</h3>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Choose the plan that fits your automation needs. All plans include best-in-class AI workflow generation and step-by-step guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingTier
          name="Free Plan"
          description="7-day trial, then upgrade required."
          price="$0"
          priceDetail="/trial"
          features={[
            "50–100 credits (introductory)",
            "Natural language → n8n JSON workflow generation",
            "Step-by-step guide with each workflow",
            "Basic support",
          ]}
          buttonText="Start Free Trial"
          buttonLink="/dashboard"
        />

        <PricingTier
          name="Pro Plan"
          description="For power users and teams."
          price="$17.99"
          priceDetail="/month"
          features={[
            "500 credits/month",
            "All Free features",
            "Priority AI processing",
            "Upload files/images for smarter prompts",
            "Retain workflows",
            "Multi-turn refinement chat",
          ]}
          buttonText="Upgrade to Pro"
          buttonLink="/dashboard"
          popular
        />

        <PricingTier
          name="Pay-As-You-Go (PAYG)"
          description="Great for occasional users."
          price="$5"
          priceDetail="per 100 requests"
          features={[
            "No subscription required",
            "All standard generation features",
            "Credits expire after 30 days",
          ]}
          buttonText="Buy Credits"
          buttonLink="/dashboard"
        />
      </div>
    </section>
  );
}
