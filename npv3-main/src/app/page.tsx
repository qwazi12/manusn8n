import Blog from "@/components/sections/blog";
import CTA from "@/components/sections/cta";
import FAQ from "@/components/sections/faq";
import Features from "@/components/sections/features";
import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Problem from "@/components/sections/problem";
import Solution from "@/components/sections/solution";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <FAQ />
      <Blog />
      <CTA />
      <Footer />
    </main>
  );
}
