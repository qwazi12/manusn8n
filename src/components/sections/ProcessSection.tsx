import Image from "next/image";

interface ProcessStepProps {
  title: string;
  description: string;
  image: string;
  alt: string;
  tag: string;
}

function ProcessStep({ title, description, image, alt, tag }: ProcessStepProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 md:mb-24">
      <div className="w-full md:w-1/2 order-2 md:order-1">
        <div className="inline-flex items-center rounded-full border bg-primary/10 border-primary/20 px-3 py-1 text-sm mb-4">
          <span className="text-primary font-medium">{tag}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
        <p className="text-lg text-muted-foreground">{description}</p>
      </div>
      <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export function ProcessSection() {
  return (
    <section className="container mx-auto py-16 md:py-24">
      <h2 className="text-lg font-medium text-muted-foreground mb-2 text-center">How It Works</h2>
      <h3 className="text-3xl md:text-4xl font-bold mb-16 text-center">Step-by-Step Process</h3>

      <ProcessStep
        tag="Automate"
        title="Streamline Your Workflow with AI"
        description="Leverage the power of AI to create seamless automation scripts that save time and boost productivity."
        image="/roboto.png"
        alt="Streamline your workflow illustration"
      />

      <ProcessStep
        tag="Design"
        title="Build Custom Workflows Effortlessly"
        description="Use our intuitive interface to design workflows tailored to your specific needs without writing a single line of code."
        image="/pacheco.png"
        alt="Build custom workflows illustration"
      />

      <ProcessStep
        tag="Optimize"
        title="Enhance Efficiency with Smart Suggestions"
        description="Our AI provides intelligent recommendations to optimize your workflows for maximum efficiency and performance."
        image="/runner.png"
        alt="Enhance efficiency illustration"
      />
    </section>
  );
}
