"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import ChatInputBar from "@/components/chat/ChatInputBar";
import { TrialStatus } from "@/components/trial/TrialStatus";

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
  const userName = user?.firstName || "there";

  // State for credits and trial
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  // State for messages and loading
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  // State for conversation persistence
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);

  // Fetch user credits and load conversation history on component mount
  useEffect(() => {
    fetchUserCredits();
    loadConversationHistory();
  }, []);

  // Load conversation history from localStorage or create new conversation
  const loadConversationHistory = async () => {
    try {
      // Try to get the last conversation ID from localStorage
      const savedConversationId = localStorage.getItem('currentConversationId');

      if (savedConversationId) {
        // Load messages for this conversation
        const response = await fetch(`/api/conversations/${savedConversationId}/messages`);
        if (response.ok) {
          const data = await response.json();
          const loadedMessages = data.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            workflow: msg.metadata?.workflow ? JSON.parse(msg.content.match(/```json\n([\s\S]*?)\n```/)?.[1] || '{}') : undefined
          }));
          setMessages(loadedMessages);
          setCurrentConversationId(savedConversationId);
        } else {
          // Conversation not found, clear localStorage
          localStorage.removeItem('currentConversationId');
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const fetchUserCredits = async () => {
    try {
      setCreditsLoading(true);
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits);
        setCredits(data.credits);
        setTrialStatus(data.trial_status);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setCreditsLoading(false);
    }
  }; // Will be fetched from API

  // Function to start a new conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem('currentConversationId');
  };

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
      // Call the Next.js API route (which proxies to the backend)
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationId: currentConversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process message');
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.conversationResponse || data.message,
        timestamp: new Date(),
        workflow: data.workflow
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation ID and save to localStorage
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
        localStorage.setItem('currentConversationId', data.conversationId);
      }

      // Update credits if provided
      if (data.creditsRemaining !== undefined) {
        setCredits(data.creditsRemaining);
        setUserCredits(data.creditsRemaining);
      }

      // Refresh trial status after potential credit usage
      fetchUserCredits();

    } catch (error: any) {
      console.error('Error generating workflow:', error);

      // Handle trial expiration errors
      if (error.status === 402) {
        try {
          const errorData = await error.json();
          if (errorData.upgrade_required) {
            setTrialExpired(true);
            const errorMessage: Message = {
              role: 'assistant',
              content: `❌ **${errorData.error}**

${errorData.message}

[Click here to upgrade](/pricing)`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
      }

      // Add generic error message
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
            {messages.length > 0 && (
              <button
                onClick={startNewConversation}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                🆕 New Chat
              </button>
            )}
          </div>

          {/* Minimal Trial Warnings Only */}
          {trialStatus?.show_blocking_modal && (
            <TrialStatus onTrialExpired={() => {}} />
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
                      <div className="mt-3 p-2 bg-gray-100 rounded text-xs space-x-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(message.workflow, null, 2));
                            alert('Workflow JSON copied to clipboard!');
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          📋 Copy JSON
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(message.workflow, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `workflow-${Date.now()}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          💾 Download JSON
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
            {creditsLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <span className="text-sm text-gray-500 font-medium">
                {credits !== null ? `${credits} credits` : 'Loading credits...'}
              </span>
            )}
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
