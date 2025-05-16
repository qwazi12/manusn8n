import { HeroSection } from "@/components/sections/HeroSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { DiscordCTASection } from "@/components/sections/DiscordCTASection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FAQSection } from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <ProcessSection />
      <TestimonialsSection />
      <DiscordCTASection />
      <PricingSection />
      <ContactSection />
      <FAQSection />
    </>
  );
}
