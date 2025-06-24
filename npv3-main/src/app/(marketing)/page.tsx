import { Button } from "@/components/ui/button";
import FeaturesHorizontal from "@/components/features-horizontal";
import FeaturesVertical from "@/components/features-vertical";
import Section from "@/components/section";
import { Check, BarChart, Settings, Users, Zap, FileText, MessageSquare, Upload } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

const featuresData = [
  {
    id: 1,
    sectionId: "workflow-generation",
    title: "AI Workflow Generation",
    content: "Generate optimized n8n JSON instantly with our advanced AI technology.",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 2,
    sectionId: "chat-refinement",
    title: "Real-Time Chat",
    content: "Refine your workflows through natural conversation with our AI assistant.",
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    id: 3,
    sectionId: "file-support",
    title: "File Support",
    content: "Upload files and screenshots to provide context for better workflow generation.",
    icon: <Upload className="h-6 w-6" />,
  },
];

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero Section */}
      <Section className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Transform Your Workflow with{" "}
          <span className="text-primary">NodePilot</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The AI-powered solution for n8n workflow automation. Generate, refine, and optimize
          your workflows with natural language - no coding required.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
        <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>3 free workflows per day</span>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section id="features" className="flex flex-col gap-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">AI-Powered Features</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to automate your workflows efficiently
          </p>
        </div>
        <FeaturesVertical data={featuresData} />
      </Section>

      {/* Individual Feature Sections */}
      <Section id="workflow-generation" className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">AI Workflow Generation</h2>
          <p className="mt-4 text-muted-foreground">
            Generate optimized n8n workflows instantly using natural language
          </p>
        </div>
      </Section>

      <Section id="chat-refinement" className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Real-Time Chat Refinement</h2>
          <p className="mt-4 text-muted-foreground">
            Refine your workflows through natural conversation with our AI
          </p>
        </div>
      </Section>

      <Section id="file-support" className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">File Support</h2>
          <p className="mt-4 text-muted-foreground">
            Upload files and screenshots for better workflow generation
          </p>
        </div>
      </Section>

      {/* Pricing Section */}
      <Section id="pricing" className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-muted-foreground">
            Choose the plan that's right for you
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {siteConfig.pricing.map((plan) => (
            <div key={plan.name} className="flex flex-col gap-4 rounded-lg border p-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-4" asChild>
                <Link href={plan.href}>{plan.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Individual Plan Sections */}
      <Section id="free-plan" className="sr-only">
        <h2>Free Plan</h2>
      </Section>

      <Section id="starter-plan" className="sr-only">
        <h2>Starter Plan</h2>
      </Section>

      <Section id="pro-plan" className="sr-only">
        <h2>Pro Plan</h2>
      </Section>

      {/* CTA Section */}
      <Section className="flex flex-col items-center gap-8 text-center">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="max-w-2xl text-muted-foreground">
          Join thousands of users already using NodePilot to transform their n8n workflows.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Start Your Free Trial</Link>
        </Button>
      </Section>
    </div>
  );
} 