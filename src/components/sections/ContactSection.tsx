import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Mail, MessageCircle, Clock } from "lucide-react";

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
  return (
    <section id="contact" className="container mx-auto py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-lg font-medium text-muted-foreground mb-2">Contact</h2>
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h3>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Have questions or need help with automating your workflows using AI? Reach out to us, and let's build something amazing together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <ContactMethod
            icon={<MessageCircle className="h-5 w-5 text-primary" />}
            title="DM Us"
            description={
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="https://discord.gg/tVb7zvMY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Join Discord Community
                </Link>
              </Button>
            }
          />

          <ContactMethod
            icon={<Mail className="h-5 w-5 text-primary" />}
            title="Email Us"
            description="manalkaff@gmail.com"
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

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Your last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this regarding?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your application needs..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
