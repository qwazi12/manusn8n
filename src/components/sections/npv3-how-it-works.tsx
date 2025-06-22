import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Play, TrendingUp } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    number: "1",
    title: "Automate",
    subtitle: "Streamline Your Workflow with AI",
    description: "Leverage the power of AI to create seamless n8n automation scripts that save time and boost productivity. Simply describe your automation needs in natural language.",
    icon: <Upload className="h-8 w-8 text-primary" />,
    image: "/dashboard.png"
  },
  {
    number: "2",
    title: "Design",
    subtitle: "Build Custom Workflows Effortlessly",
    description: "Describe what you want to automate in plain English. Our intelligent AI designs n8n workflows tailored to your specific needs without writing a single line of code. Get complete workflow JSON ready for import.",
    icon: <Play className="h-8 w-8 text-primary" />,
    image: "/dashboard.png"
  },
  {
    number: "3",
    title: "Optimize",
    subtitle: "Enhance Efficiency with Smart Suggestions",
    description: "Our AI provides intelligent recommendations to optimize your n8n workflows for maximum efficiency and performance, including error handling and best practices.",
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    image: "/dashboard.png"
  }
];

export default function NPV3HowItWorks() {
  return (
    <Section
      title="How It Works"
      subtitle="Step-by-Step Process"
      className="bg-muted/30"
    >
      <div className="space-y-16">
        {steps.map((step, index) => (
          <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  {step.number}
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <h4 className="text-lg font-semibold text-primary">{step.subtitle}</h4>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border shadow-lg">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
