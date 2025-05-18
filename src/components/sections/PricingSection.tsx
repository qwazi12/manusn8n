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
}: PricingTierProps) {
  return (
    <Card className={`border ${popular ? 'border-primary/50 shadow-lg' : ''} flex flex-col h-full`}>
      {badge && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            {badge}
          </div>
        </div>
      )}
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
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Get more workflows</h3>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Enjoy exclusive pricing for our new AI-driven automation platform. Unlock powerful workflows at an unbeatable value!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PricingTier
          name="Free"
          description="Basic support with limited daily prompts."
          price="$0"
          priceDetail="/month"
          features={[
            "Basic Support",
            "500 Credits",
          ]}
          buttonText="Start for Free"
          buttonLink="/dashboard"
        />

        <PricingTier
          name="Discord"
          description="Enhanced free tier for Discord community members."
          price="$0"
          priceDetail="/month"
          features={[
            "Priority Support",
            "1000 Credits",
          ]}
          buttonText="Join Discord"
          buttonLink="https://discord.gg/BFnVZ9D4aG"
        />

        <PricingTier
          name="Monthly"
          description="Entry-level monthly plan with priority support."
          price="$1.99"
          priceDetail="/month"
          features={[
            "Priority Support",
            "2,000 Credits per Month",
          ]}
          buttonText="Subscribe Monthly"
          buttonLink="/subscribe/monthly"
        />

        <PricingTier
          name="Annual"
          description="Best value with significant yearly savings. Charged Annualy"
          price="$12"
          priceDetail="/month"
          features={[
            "High Priority Support",
            "150K Prompts Annually",
          ]}
          buttonText="Subscribe Annually"
          buttonLink="/subscribe/annually"
        />
      </div>
    </section>
  );
}
