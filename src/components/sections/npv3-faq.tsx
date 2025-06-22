import Section from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Nodepilot?",
    answer: "Nodepilot is a platform that helps you build and manage your AI-powered applications. It provides tools and services to streamline the development and deployment of AI solutions."
  },
  {
    question: "How can I get started with Nodepilot?",
    answer: "You can get started with Nodepilot by signing up for an account on our website, creating a new project, and following our quick-start guide. We also offer tutorials and documentation to help you along the way."
  },
  {
    question: "What types of AI models does Nodepilot support?",
    answer: "Nodepilot supports a wide range of AI models, including but not limited to natural language processing, computer vision, and predictive analytics. We continuously update our platform to support the latest AI technologies."
  },
  {
    question: "Is Nodepilot suitable for beginners in AI development?",
    answer: "Yes, Nodepilot is designed to be user-friendly for both beginners and experienced developers. We offer intuitive interfaces, pre-built templates, and extensive learning resources to help users of all skill levels create AI-powered applications."
  },
  {
    question: "What kind of support does Nodepilot provide?",
    answer: "Nodepilot provides comprehensive support including documentation, video tutorials, a community forum, and dedicated customer support. We also offer premium support plans for enterprises with more complex needs."
  }
];

export default function NPV3FAQ() {
  return (
    <Section title="FAQ" subtitle="Frequently asked questions">
      <div className="mx-auto my-12 md:max-w-[800px]">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col items-center justify-center space-y-2"
        >
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={faq.question}
              className="w-full border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <h4 className="mb-12 text-center text-sm font-medium tracking-tight text-foreground/80">
        Still have questions? Email us at{" "}
        <a href="mailto:nodepilotdev@gmail.com" className="underline">
          nodepilotdev@gmail.com
        </a>
      </h4>
    </Section>
  );
}
