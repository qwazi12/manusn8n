import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BenefitsSection() {
  const benefits = [
    {
      id: "01",
      title: "Streamline Workflows",
      description: "Effortlessly automate repetitive tasks and streamline your workflows with AI-powered n8n scripts."
    },
    {
      id: "02",
      title: "Boost Productivity",
      description: "Increase efficiency by automating complex processes, allowing your team to focus on what matters most."
    },
    {
      id: "03",
      title: "Save Time and Money",
      description: "Reduce operational costs and save valuable time by leveraging intelligent automation for your business."
    },
    {
      id: "04",
      title: "Innovate with Ease",
      description: "Quickly create and test automation ideas using AI, enabling faster innovation and growth."
    }
  ];

  return (
    <section className="container mx-auto py-16 md:py-24">
      <div className="mb-12">
        <h2 className="text-lg font-medium text-muted-foreground mb-2">Benefits</h2>
        <h3 className="text-3xl md:text-4xl font-bold">Your Shortcut to Success</h3>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Leverage the power of AI to create n8n automation scripts effortlessly.
          Simplify complex workflows and unlock your team's full potential with
          intelligent automation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit) => (
          <Card key={benefit.id} className="border bg-card/50 hover:bg-card/80 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-start">
                <span className="text-primary mr-2">{benefit.id}</span>
                <h4 className="text-xl font-bold">{benefit.title}</h4>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {benefit.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
