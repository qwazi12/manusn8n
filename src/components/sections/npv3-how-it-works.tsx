import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Play, TrendingUp } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    number: "1",
    title: "Upload Your Data",
    description: "Simply upload your data to our secure platform. We support various file formats and data types to ensure a seamless integration with your existing systems.",
    icon: <Upload className="h-8 w-8 text-primary" />,
    image: "/dashboard.png"
  },
  {
    number: "2", 
    title: "Click Start",
    description: "Our advanced AI algorithms automatically process and analyze your data, extracting valuable insights and patterns that would be difficult to identify manually.",
    icon: <Play className="h-8 w-8 text-primary" />,
    image: "/dashboard.png"
  },
  {
    number: "3",
    title: "Get Actionable Insights",
    description: "Receive clear, actionable insights and recommendations based on the AI analysis. Use these insights to make data-driven decisions and improve your business strategies.",
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    image: "/dashboard.png"
  }
];

export default function NPV3HowItWorks() {
  return (
    <Section 
      title="How it works" 
      subtitle="Just 3 steps to get started"
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
