import Section from "@/components/section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Clock, Shield } from "lucide-react";

const problems = [
  {
    title: "Complex Node Configuration",
    description: "n8n offers powerful automation capabilities, but setting up workflows requires deep understanding of node parameters, data mapping, and connection logic. New users often spend hours figuring out what experts can configure in minutes.",
    icon: <Database className="h-8 w-8 text-primary" />
  },
  {
    title: "Time-Consuming Development",
    description: "Building workflows from scratch involves researching documentation, testing connections, debugging errors, and optimizing performance. What should be quick automation setup becomes lengthy development projects.",
    icon: <Clock className="h-8 w-8 text-primary" />
  },
  {
    title: "Technical Barriers",
    description: "Advanced features like error handling, data transformation, and API integrations require programming knowledge that many users don't possess, limiting their ability to create robust automations.",
    icon: <Shield className="h-8 w-8 text-primary" />
  }
];

export default function NPV3Problem() {
  return (
    <Section
      title="Problem"
      subtitle="Creating n8n workflows manually is complex and time-consuming."
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
