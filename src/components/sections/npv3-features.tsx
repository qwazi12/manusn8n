import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BookOpen, MessageCircle, Upload } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Instant Workflow Generation",
    description: "Transform natural language descriptions into complete n8n workflows with proper node configurations, connections, and error handling built-in.",
    icon: <Zap className="h-8 w-8 text-primary" />
  },
  {
    number: "02",
    title: "Smart Node Selection",
    description: "Our AI automatically selects the optimal nodes for your automation needs, ensuring efficient workflows that follow n8n best practices.",
    icon: <BookOpen className="h-8 w-8 text-primary" />
  },
  {
    number: "03",
    title: "Ready-to-Import JSON",
    description: "Get production-ready workflow files that you can directly import into your n8n instance without any manual configuration required.",
    icon: <MessageCircle className="h-8 w-8 text-primary" />
  },
  {
    number: "04",
    title: "Detailed Explanations",
    description: "Understand exactly how your workflow operates with step-by-step explanations of each node, connection, and data transformation process.",
    icon: <Upload className="h-8 w-8 text-primary" />
  }
];

export default function NPV3Features() {
  return (
    <Section
      title="Features"
      subtitle="Your Shortcut to Success"
      description="Leverage the power of AI to create n8n automation scripts effortlessly. Simplify complex workflows and unlock your team's full potential with intelligent automation."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border bg-card/50 hover:bg-card/80 transition-colors group hover:scale-105 duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {feature.number}
                </div>
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
              </div>
              <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
