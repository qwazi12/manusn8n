"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { DiscordCTASection } from "@/components/sections/DiscordCTASection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center py-6">
          {!isSignedIn && (
            <Button
              onClick={() => router.push('/auth')}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Get Started
            </Button>
          )}
        </div>

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
