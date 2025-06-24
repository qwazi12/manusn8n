"use client";

import Link from "next/link";
import { Icons } from "@/components/icons";
import BlurFade from "@/components/magicui/blur-fade";
import { ChevronRight, Mail, MessageCircle } from "lucide-react";

const footerSections = [
  {
    title: "Product",
    links: [
      { text: "Features", href: "/#features" },
      { text: "Pricing", href: "/pricing" },
      { text: "Dashboard", href: "/dashboard" },
      { text: "Blog", href: "/blog" },
    ]
  },
  {
    title: "Support",
    links: [
      { text: "Contact Us", href: "/#contact", icon: <Mail className="h-4 w-4" /> },
      { text: "FAQ", href: "/#faq" },
      { text: "Documentation", href: "/#faq" },
      { text: "Feedback", href: "/#contact" },
    ]
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy Policy", href: "/privacy" },
      { text: "Terms of Service", href: "/tos" },
      { text: "Refund Policy", href: "/refund" },
    ]
  },
  {
    title: "Community",
    links: [
      {
        text: "Join Discord",
        href: "https://discord.gg/FJDnUQjP",
        icon: <MessageCircle className="h-4 w-4" />,
        external: true
      },
      { text: "Blog", href: "/blog" },
      { text: "Updates", href: "/blog" },
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t bg-background/50 backdrop-blur">
      <div className="container py-16">
        <BlurFade delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Icons.logo className="w-auto h-[40px]" />
                <span className="font-bold text-xl">NodePilot</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                AI-powered n8n workflow generation. Transform your automation ideas into reality with intelligent, step-by-step guidance.
              </p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Contact: <Link href="mailto:nodepilotdev@gmail.com" className="text-primary hover:underline">nodepilotdev@gmail.com</Link>
                </p>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.icon && link.icon}
                        {link.text}
                        <ChevronRight className="h-3 w-3 translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </BlurFade>

        {/* Bottom Section */}
        <BlurFade delay={0.4}>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NodePilot. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/tos" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/refund" className="hover:text-foreground transition-colors">
                Refund
              </Link>
            </div>
          </div>
        </BlurFade>
      </div>
    </footer>
  );
}
