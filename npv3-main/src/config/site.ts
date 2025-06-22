export const siteConfig = {
  name: "Nodepilot",
  description: "Automate anything. Visually. Instantly.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "https://nodepilot.dev/og.jpg",
  links: {
    twitter: "https://twitter.com/nodepilot",
    github: "https://github.com/nodepilot",
  },
  creator: "@nodepilot",
} as const; 