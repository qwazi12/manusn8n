"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import ChatInputBar from "@/components/chat/ChatInputBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PaygCreditPurchase } from "@/components/billing/PaygCreditPurchase";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: File[];
  timestamp: Date;
  workflow?: any;
  isLoading?: boolean;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { has } = useAuth();
  const userName = user?.firstName || "there";

  // Check user's plan and features
  const hasProPlan = has({ plan: 'pro' });
  const hasPaygPlan = has({ plan: 'payg' });
  const hasFileUpload = has({ feature: 'file_upload' });
  const hasPriorityProcessing = has({ feature: 'priority_processing' });

  // State for showing credit purchase
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [userCredits, setUserCredits] = useState(100); // This should come from API

  // State for messages and loading
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(100); // Will be fetched from API

  // Handler for sending a message
  const handleSendMessage = async (message: string, files: File[]) => {
    if (isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      files,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the backend API to generate workflow
      const response = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          files: files.map(f => f.name) // For now, just send file names
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workflow');
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: `✅ **Workflow Generated Successfully!**

**Prompt:** ${message}

**Generated Workflow:**
- **Nodes:** ${data.workflow?.nodes?.length || 0} workflow steps
- **Connections:** ${data.workflow?.connections?.length || 0} data flows
- **Status:** Ready to use

**Credits Used:** 1
**Remaining Credits:** ${data.remaining_credits}

You can copy this workflow JSON and import it directly into n8n!`,
        timestamp: new Date(),
        workflow: data.workflow
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCredits(data.remaining_credits);

    } catch (error) {
      console.error('Error generating workflow:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Error generating workflow**

${error instanceof Error ? error.message : 'An unexpected error occurred'}

Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SignedIn>
        <div className="max-w-4xl mx-auto mt-32 px-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hello {userName}</h1>
            <h2 className="text-2xl text-gray-700 font-normal">What can I do for you?</h2>

            {/* Plan Status */}
            <div className="mt-4 flex justify-center">
              {hasProPlan && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  ✨ Pro Plan - 500 credits/month
                </div>
              )}
              {hasPaygPlan && (
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  💰 Pay-As-You-Go Plan
                </div>
              )}
              {!hasProPlan && !hasPaygPlan && (
                <div className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  🆓 Free Trial
                  <Button asChild size="sm" variant="outline" className="ml-2 bg-white text-gray-900 hover:bg-gray-100">
                    <Link href="/pricing">Upgrade</Link>
                  </Button>
                </div>
              )}

              {/* PAYG Credit Purchase Button */}
              {(hasPaygPlan || (!hasProPlan && !hasPaygPlan)) && (
                <Button
                  onClick={() => setShowCreditPurchase(!showCreditPurchase)}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  💰 Buy Credits
                </Button>
              )}
            </div>
          </div>

          {/* PAYG Credit Purchase Section */}
          {showCreditPurchase && (
            <div className="mb-8">
              <PaygCreditPurchase
                currentCredits={userCredits}
                onPurchaseComplete={(newCredits) => {
                  setUserCredits(newCredits);
                  setShowCreditPurchase(false);
                }}
              />
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-6 space-y-4 max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 text-xs opacity-75">
                        📎 {message.files.length} file(s) attached
                      </div>
                    )}
                    {message.workflow && (
                      <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(message.workflow, null, 2));
                            alert('Workflow JSON copied to clipboard!');
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          📋 Copy Workflow JSON
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-600">Generating workflow...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat input */}
          <ChatInputBar onSendMessage={handleSendMessage} />
          <div className="flex justify-end mt-3 mb-8">
            <span className="text-sm text-gray-500">{credits} credits</span>
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
