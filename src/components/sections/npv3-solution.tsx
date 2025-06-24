import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Brain, Zap, FileText } from "lucide-react";

const solutions = [
  {
    title: "AI-Powered Dashboard",
    description: "Visualize trends and gain insights at a glance.",
    icon: <BarChart3 className="h-8 w-8 text-primary" />
  },
  {
    title: "Natural Language Processing",
    description: "Analyze text and extract sentiment effortlessly.",
    icon: <Brain className="h-8 w-8 text-primary" />
  },
  {
    title: "Predictive Analytics",
    description: "Forecast trends and make data-driven decisions.",
    icon: <Zap className="h-8 w-8 text-primary" />
  },
  {
    title: "Automated Reporting",
    description: "Generate comprehensive reports with one click.",
    icon: <FileText className="h-8 w-8 text-primary" />
  }
];

export default function NPV3Solution() {
  return (
    <Section 
      title="feature" 
      subtitle="Features"
      description="User Flows and Navigational Structures"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {solutions.map((solution, index) => (
          <Card key={index} className="border bg-card/50 hover:bg-card/80 transition-colors text-center group hover:scale-105 duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {solution.icon}
                </div>
              </div>
              <CardTitle className="text-xl font-bold">{solution.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {solution.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
