import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Clock, Shield } from "lucide-react";

const problems = [
  {
    title: "Data Overload",
    description: "Businesses struggle to make sense of vast amounts of complex data, missing out on valuable insights that could drive growth and innovation.",
    icon: <Database className="h-8 w-8 text-primary" />
  },
  {
    title: "Slow Decision-Making", 
    description: "Traditional data processing methods are too slow, causing businesses to lag behind market changes and miss crucial opportunities.",
    icon: <Clock className="h-8 w-8 text-primary" />
  },
  {
    title: "Data Security Concerns",
    description: "With increasing cyber threats, businesses worry about the safety of their sensitive information when adopting new technologies.",
    icon: <Shield className="h-8 w-8 text-primary" />
  }
];

export default function NPV3Problem() {
  return (
    <Section 
      title="Problem" 
      subtitle="Manually entering your data is a hassle."
      className="bg-muted/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {problems.map((problem, index) => (
          <Card key={index} className="border bg-card/50 hover:bg-card/80 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  {problem.icon}
                </div>
              </div>
              <CardTitle className="text-xl font-bold">{problem.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {problem.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
