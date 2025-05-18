import { HeroSection } from "@/components/sections/HeroSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { DiscordCTASection } from "@/components/sections/DiscordCTASection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <ProcessSection />
      <DiscordCTASection />
      <PricingSection />
      <ContactSection />
      <FAQSection />
    </>
  );
}
