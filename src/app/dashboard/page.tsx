"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useState } from "react";
import ChatInputBar from "@/components/chat/ChatInputBar";

export default function DashboardPage() {
  const { user } = useUser();
  const userName = user?.firstName || "there";

  // State for messages
  const [messages, setMessages] = useState<Array<{ content: string; files: File[] }>>([]);

  // Handler for sending a message
  const handleSendMessage = (message: string, files: File[]) => {
    setMessages(prev => [...prev, { content: message, files }]);
    // TODO: Implement actual workflow generation logic here
  };

  return (
    <>
      <SignedIn>
        <div className="max-w-4xl mx-auto mt-32 px-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hello {userName}</h1>
            <h2 className="text-2xl text-gray-700 font-normal">What can I do for you?</h2>
          </div>

          {/* Chat input */}
          <ChatInputBar onSendMessage={handleSendMessage} />
          <div className="flex justify-end mt-3 mb-8">
            <span className="text-sm text-gray-500">100 credits</span>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Create an automated marketing campaign workflow that integrates email, social media, and CRM platforms for coordinated multi-channel marketing efforts.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">Automate Marketing Campaigns</CardTitle>
                      <CardDescription className="text-gray-400">for managing multi-channel marketing efforts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Build an AI-powered lead scoring system that analyzes customer data, interaction history, and behavior patterns to prioritize and rank sales leads.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">AI-Powered Lead Scoring</CardTitle>
                      <CardDescription className="text-gray-400">for prioritizing sales leads</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Design a personalized recommendation engine that analyzes user behavior and preferences to generate tailored content and product suggestions for improved engagement.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">Generate Personalized Recommendations</CardTitle>
                      <CardDescription className="text-gray-400">for improving user engagement</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Set up an automated social media content scheduler that manages post timing, content distribution, and engagement tracking across multiple platforms.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">Social Media Content Scheduler</CardTitle>
                      <CardDescription className="text-gray-400">for automating social media posts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
