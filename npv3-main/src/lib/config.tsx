import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "NodePilot",
  description: "Automate your workflow with AI",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["n8n", "Automation", "AI", "Workflow", "NodePilot"],
  links: {
    email: "support@nodepilot.dev",
    twitter: "https://twitter.com/nodepilot",
    instagram: "https://instagram.com/nodepilot",
    youtube: "https://youtube.com/@nodepilot",
  },
  header: [
    {
      trigger: "Features",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "AI-Powered Automation",
          description: "Create n8n workflows effortlessly with AI.",
          href: "/#features",
        },
        items: [
          {
            href: "/#workflow-generation",
            title: "AI Workflow Generation",
            description: "Generate optimized n8n JSON instantly.",
          },
          {
            href: "/#chat-refinement",
            title: "Real-Time Chat",
            description: "Refine workflows through AI conversation.",
          },
          {
            href: "/#file-support",
            title: "File Support",
            description: "Upload files and screenshots for context.",
          },
        ],
      },
    },
    {
      trigger: "Pricing",
      content: {
        main: {
          icon: <Icons.sparkles className="h-6 w-6" />,
          title: "Simple, Transparent Pricing",
          description: "Choose the plan that's right for you.",
          href: "/#pricing",
        },
        items: [
          {
            href: "/#free-plan",
            title: "Free Plan",
            description: "3 Workflows per day, No Login Required",
          },
          {
            href: "/#starter-plan",
            title: "Starter - $9.99/mo",
            description: "30 Workflows/month, History & Support",
          },
          {
            href: "/#pro-plan",
            title: "Pro - $18.99/mo",
            description: "Unlimited Workflows, Export to n8n",
          },
        ],
      },
    },
    {
      href: "/blog",
      label: "Blog",
    },
  ],
  pricing: [
    {
      name: "Free",
      href: "/dashboard",
      price: "$0",
      period: "forever",
      features: [
        "3 Workflows per day",
        "No Login Required",
        "Limited to JSON View",
        "Limited File Upload (Images, PDFs)",
      ],
      description: "Perfect for trying out NodePilot",
      buttonText: "Try for Free",
      isPopular: false,
    },
    {
      name: "Starter",
      href: "/billing",
      price: "$9.99",
      period: "month",
      features: [
        "30 Workflows / month",
        "Workflow History (15 days)",
        "Support Access",
        "JSON Download",
        "Unlimited File Upload",
      ],
      description: "Great for regular automation builders",
      buttonText: "Upgrade for $9.99",
      isPopular: true,
    },
    {
      name: "Pro",
      href: "/billing",
      price: "$18.99",
      period: "month",
      features: [
        "Everything in Starter",
        "Unlimited Workflows",
        "Export to n8n",
        "Chat History (2 Months)",
      ],
      description: "For power users who need it all",
      buttonText: "Unlock Everything $18.99",
      isPopular: false,
    },
  ],
  faqs: [
    {
      question: "What is Nodepilot?",
      answer: (
        <span>
          Nodepilot is a platform that helps you build and manage your AI-powered
          applications. It provides tools and services to streamline the
          development and deployment of AI solutions.
        </span>
      ),
    },
    {
      question: "How can I get started with Nodepilot?",
      answer: (
        <span>
          You can get started with Nodepilot by signing up for an account on our
          website, creating a new project, and following our quick-start guide.
          We also offer tutorials and documentation to help you along the way.
        </span>
      ),
    },
    {
      question: "What types of AI models does Nodepilot support?",
      answer: (
        <span>
          Nodepilot supports a wide range of AI models, including but not limited
          to natural language processing, computer vision, and predictive
          analytics. We continuously update our platform to support the latest
          AI technologies.
        </span>
      ),
    },
    {
      question: "Is Nodepilot suitable for beginners in AI development?",
      answer: (
        <span>
          Yes, Nodepilot is designed to be user-friendly for both beginners and
          experienced developers. We offer intuitive interfaces, pre-built
          templates, and extensive learning resources to help users of all skill
          levels create AI-powered applications.
        </span>
      ),
    },
    {
      question: "What kind of support does Nodepilot provide?",
      answer: (
        <span>
          Nodepilot provides comprehensive support including documentation, video
          tutorials, a community forum, and dedicated customer support. We also
          offer premium support plans for enterprises with more complex needs.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "/features", text: "Features", icon: null },
        { href: "/pricing", text: "Pricing", icon: null },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", text: "About", icon: null },
        { href: "/contact", text: "Contact", icon: null },
      ],
    },
    {
      title: "Social",
      links: [
        {
          href: "https://twitter.com/nodepilot",
          text: "Twitter",
          icon: <FaTwitter />,
        },
        {
          href: "https://instagram.com/nodepilot",
          text: "Instagram",
          icon: <RiInstagramFill />,
        },
        {
          href: "https://youtube.com/@nodepilot",
          text: "Youtube",
          icon: <FaYoutube />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
