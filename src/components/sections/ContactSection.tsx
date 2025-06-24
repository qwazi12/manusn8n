"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BlurFade from "@/components/magicui/blur-fade";
import Link from "next/link";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { useState } from "react";

interface ContactMethodProps {
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
}

function ContactMethod({ icon, title, description }: ContactMethodProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="bg-primary/10 rounded-full p-3">
        {icon}
      </div>
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('Message sent successfully! We will get back to you soon.');
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="container mx-auto py-16 md:py-24">
      <BlurFade delay={0.2}>
        <div className="text-center mb-12">
          <h2 className="text-lg font-medium text-primary mb-2">Contact</h2>
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions or need help with automating your workflows using AI? Reach out to us, and let's build something amazing together.
          </p>
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BlurFade delay={0.3}>
          <div className="md:col-span-1 space-y-6">
          <ContactMethod
            icon={<MessageCircle className="h-5 w-5 text-primary" />}
            title="DM Us"
            description={
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="https://discord.gg/FJDnUQjP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Join Discord Server
                </Link>
              </Button>
            }
          />

          <ContactMethod
            icon={<Mail className="h-5 w-5 text-primary" />}
            title="Email Us"
            description="nodepilotdev@gmail.com"
          />

          <ContactMethod
            icon={<Clock className="h-5 w-5 text-primary" />}
            title="Working Hours"
            description={
              <>
                Monday - Friday
                <br />
                9AM - 6PM
              </>
            }
          />
          </div>
        </BlurFade>

        <BlurFade delay={0.4}>
          <div className="md:col-span-2">
            <Card className="bg-card/50 hover:bg-card/80 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl">Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="Your first name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Your last name" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Your email address" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="What is this regarding?" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your application needs..."
                    rows={4}
                    required
                  />
                </div>

                {submitMessage && (
                  <div className={`p-3 rounded-md text-sm ${
                    submitMessage.includes('successfully')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
