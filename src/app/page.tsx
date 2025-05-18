"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { DiscordCTASection } from "@/components/sections/DiscordCTASection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FAQSection } from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <BenefitsSection />
        <ProcessSection />
        <DiscordCTASection />
        <PricingSection />
        <ContactSection />
        <FAQSection />
      </div>
    </div>
  );
}
