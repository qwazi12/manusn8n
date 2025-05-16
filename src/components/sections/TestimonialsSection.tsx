import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
}

function Testimonial({ quote, name, title }: TestimonialProps) {
  return (
    <Card className="border shadow-sm h-full flex flex-col">
      <CardContent className="pt-6 flex-1">
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((starNumber) => (
            <svg
              key={`star-${starNumber}`}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="#d82855"
              stroke="none"
              className="mr-1"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <p className="text-muted-foreground">{quote}</p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex items-center">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
          <span className="text-primary font-bold text-sm">{name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardFooter>
    </Card>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      id: "testimonial-1",
      quote: "This AI-powered n8n automation tool has revolutionized the way I build workflows. It's intuitive and saves me hours of manual work.",
      name: "John Doe",
      title: "Automation Expert"
    },
    {
      id: "testimonial-2",
      quote: "The AI integration in this tool is phenomenal. It simplifies complex automation tasks and makes everything so much faster!",
      name: "Jane Smith",
      title: "Tech Enthusiast"
    },
    {
      id: "testimonial-3",
      quote: "This SaaS has made creating n8n automation scripts effortless. The AI suggestions are spot-on and incredibly helpful.",
      name: "Michael Brown",
      title: "Software Engineer"
    },
    {
      id: "testimonial-4",
      quote: "I love how this tool combines AI with n8n. It has streamlined my workflow design process and improved my productivity significantly.",
      name: "Emily Davis",
      title: "Workflow Designer"
    },
    {
      id: "testimonial-5",
      quote: "This is a game-changer for anyone working with n8n. The AI-powered features are intuitive and make automation accessible to everyone.",
      name: "Chris Wilson",
      title: "Freelance Developer"
    },
    {
      id: "testimonial-6",
      quote: "Thanks to this tool, I can now create complex automation workflows without needing extensive coding knowledge. Highly recommend it!",
      name: "Sophia Lee",
      title: "Business Analyst"
    }
  ];

  return (
    <section className="container mx-auto py-16 md:py-24">
      <h2 className="text-lg font-medium text-muted-foreground mb-2 text-center">Testimonials</h2>
      <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center">Hear What Our Clients Say</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Testimonial
            key={testimonial.id}
            quote={testimonial.quote}
            name={testimonial.name}
            title={testimonial.title}
          />
        ))}
      </div>
    </section>
  );
}
