import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, BookOpen, MessageCircle, Upload } from "lucide-react";

const features = [
  {
    title: "AI Workflow Generation",
    description: "Generate optimized n8n workflows instantly using natural language. Just describe what you want to automate.",
    icon: <Zap className="h-8 w-8 text-primary" />
  },
  {
    title: "Step-by-Step Instructions",
    description: "Every workflow comes with clear explanations. Understand exactly how your automation works.",
    icon: <BookOpen className="h-8 w-8 text-primary" />
  },
  {
    title: "Real-Time Chat Refinement",
    description: "Refine your workflows through interactive AI chat. Get exactly what you need through natural conversation.",
    icon: <MessageCircle className="h-8 w-8 text-primary" />
  },
  {
    title: "File & Screenshot Support",
    description: "Upload files and screenshots to provide better context for your automation needs.",
    icon: <Upload className="h-8 w-8 text-primary" />
  }
];

export default function NPV3Features() {
  return (
    <Section 
      title="Features" 
      subtitle="Build n8n Workflows with AI"
      description="Stop struggling with manual workflow creation. Let our AI co-pilot help you build powerful n8n automations in minutes."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="border bg-card/50 hover:bg-card/80 transition-colors group hover:scale-105 duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
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
