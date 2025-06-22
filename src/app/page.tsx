"use client";

import NPV3Hero from "@/components/sections/npv3-hero";
import NPV3Problem from "@/components/sections/npv3-problem";
import NPV3Features from "@/components/sections/npv3-features";
import NPV3HowItWorks from "@/components/sections/npv3-how-it-works";
import NPV3FAQ from "@/components/sections/npv3-faq";
import NPV3Blog from "@/components/sections/npv3-blog";
import NPV3CTA from "@/components/sections/npv3-cta";
import { PricingSection } from "@/components/sections/PricingSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <NPV3Hero />
      <NPV3Problem />
      <NPV3Features />
      <NPV3HowItWorks />
      <NPV3FAQ />
      <NPV3Blog />
      <PricingSection />
      <ContactSection />
      <NPV3CTA />
    </div>
  );
}
