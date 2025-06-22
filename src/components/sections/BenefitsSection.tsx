"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import BlurFade from "@/components/magicui/blur-fade";
import { Zap, TrendingUp, DollarSign, Lightbulb } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      id: "01",
      title: "Streamline Workflows",
      description: "Effortlessly automate repetitive tasks and streamline your workflows with AI-powered n8n scripts.",
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      id: "02",
      title: "Boost Productivity",
      description: "Increase efficiency by automating complex processes, allowing your team to focus on what matters most.",
      icon: <TrendingUp className="h-6 w-6 text-primary" />
    },
    {
      id: "03",
      title: "Save Time and Money",
      description: "Reduce operational costs and save valuable time by leveraging intelligent automation for your business.",
      icon: <DollarSign className="h-6 w-6 text-primary" />
    },
    {
      id: "04",
      title: "Innovate with Ease",
      description: "Quickly create and test automation ideas using AI, enabling faster innovation and growth.",
      icon: <Lightbulb className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section id="features" className="container mx-auto py-16 md:py-24">
      <BlurFade delay={0.2}>
        <div className="mb-12 text-center">
          <h2 className="text-lg font-medium text-primary mb-2">Benefits</h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Your Shortcut to Success</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Leverage the power of AI to create n8n automation scripts effortlessly.
            Simplify complex workflows and unlock your team's full potential with
            intelligent automation.
          </p>
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <BlurFade key={benefit.id} delay={0.4 + index * 0.1}>
            <Card className="relative border bg-card/50 hover:bg-card/80 transition-all duration-300 hover:scale-105 group">
              <BorderBeam
                size={250}
                duration={12}
                delay={index * 3}
                borderWidth={1.5}
                colorFrom="hsl(var(--primary))"
                colorTo="hsl(var(--primary)/0)"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {benefit.icon}
                  </div>
                  <span className="text-sm font-medium text-primary">{benefit.id}</span>
                </div>
                <CardTitle className="text-xl font-bold">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
