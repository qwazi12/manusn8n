import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "n8nCraft - Generate N8N Workflows Instantly",
  description:
    "n8nCraft offers cutting-edge solutions to generate N8N workflows instantly, explore our services to boost productivity and innovation.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-geist antialiased ${inter.variable}`}>
          <ClientBody>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ClientBody>
        </body>
      </html>
    </ClerkProvider>
  );
}
