import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FAQSection() {
  const faqs = [
    {
      question: "What is NodePilot?",
      answer: "NodePilot is an AI-powered platform that helps you create and optimize n8n automation workflows. It leverages artificial intelligence to simplify the process of building complex automations, allowing you to focus on what matters most."
    },
    {
      question: "Do I need coding skills to use this platform?",
      answer: "No coding skills are required to use NodePilot. Our AI-driven interface is designed to be user-friendly and accessible to everyone, regardless of technical background. If you're familiar with n8n, you'll find it even easier to get started."
    },
    {
      question: "Can I really create workflows for free?",
      answer: "Yes! Our free tier provides access to essential features with a limited number of daily prompts (500 credits). This is perfect for individuals who want to explore the platform or have modest automation needs."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards and PayPal for our premium subscription plans. All payments are processed securely through our payment gateway partners."
    },
    {
      question: "How do I get help if I have questions?",
      answer: "We offer multiple support channels. You can reach us through our Discord community (fastest response), email support, or by filling out the contact form on our website. Premium subscribers receive priority support with faster response times."
    }
  ];

  return (
    <section id="faq" className="container mx-auto py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-lg font-medium text-muted-foreground mb-2">FAQS</h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Common Questions</h3>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center">
            <span className="mr-2">Still have questions?</span>
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="#contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
