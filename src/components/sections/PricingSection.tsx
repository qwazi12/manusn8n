import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react";

interface PricingTierProps {
  name: string;
  description: string;
  price: string;
  priceDetail: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  popular?: boolean;
  badge?: string;
  trialDays?: number;
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
  badge,
  trialDays,
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
          {trialDays && (
            <p className="text-sm text-muted-foreground mt-1">
              {trialDays}-day free trial
            </p>
          )}
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
        <Button
          variant={popular ? "default" : "outline"}
          className="w-full"
          asChild
        >
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-lg font-medium text-muted-foreground mb-2">Pricing</h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h3>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Start with our free trial or choose a plan that fits your automation needs. All plans include our core AI workflow generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PricingTier
          name="Free Trial"
          description="Perfect for trying out NodePilot"
          price="$0"
          priceDetail="/7 days"
          trialDays={7}
          features={[
            "50-100 credits (introductory)",
            "Natural language → n8n JSON workflow",
            "Step-by-step workflow guide",
            "Basic support",
            "Upgrade required after trial"
          ]}
          buttonText="Start Free Trial"
          buttonLink="/signup"
        />

        <PricingTier
          name="Pro"
          description="For serious automation builders"
          price="$17.99"
          priceDetail="/month"
          features={[
            "500 credits per month",
            "All Free features included",
            "Priority AI processing",
            "Upload files/images for prompts",
            "Retain all workflows",
            "Multi-turn refinement chat"
          ]}
          buttonText="Go Pro"
          buttonLink="/signup?plan=pro"
        />

        <PricingTier
          name="Pay-As-You-Go"
          description="Perfect for occasional use"
          price="$5"
          priceDetail="/100 requests"
          features={[
            "No subscription required",
            "All standard generation features",
            "Credits expire after 30 days",
            "Great for occasional users",
            "Pay only for what you need"
          ]}
          buttonText="Start PAYG"
          buttonLink="/signup?plan=payg"
        />
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include our core workflow generation features. Need a custom plan?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
