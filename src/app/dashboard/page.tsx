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
      let response: Response;

      if (files.length > 0) {
        // Send as FormData if files are attached
        const formData = new FormData();
        formData.append('message', message);
        if (currentConversationId) {
          formData.append('conversationId', currentConversationId);
        }

        // Add files to FormData
        files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });

        response = await fetch('/api/chat/message', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Send as JSON if no files
        response = await fetch('/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            conversationId: currentConversationId,
          }),
        });
      }

      if (!response.ok) {
        // Try to parse error response as JSON, fallback to text
        let errorMessage = 'Failed to process message';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, get text response
          const errorText = await response.text();
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

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
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
        type: typeof error
      });

      // Handle trial expiration errors
      if (error.status === 402) {
        try {
          // Only try to parse JSON if error has a json method (it's a Response object)
          if (typeof error.json === 'function') {
            const errorData = await error.json();
            if (errorData.upgrade_required) {
              // Redirect to pricing page for upgrade
              window.location.href = '/pricing';
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
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                🆕 New Chat
              </button>
            )}
          </div>



          {/* Minimal Trial Warnings Only */}
          {trialStatus?.show_blocking_modal && (
            <TrialStatus onTrialExpired={() => window.location.href = '/pricing'} />
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="mb-6 space-y-4 bg-gray-50 rounded-lg p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
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
                          className="text-primary hover:text-primary/80 mr-2"
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-gray-600">NodePilot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat input - Sticky at bottom when messages exist */}
          <div className={`${messages.length > 0 ? 'sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200' : ''}`}>
            <ChatInputBar onSendMessage={handleSendMessage} />
            <div className="flex justify-end mt-3">
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
          </div>

          <div className={`space-y-6 ${messages.length > 0 ? 'mb-32' : 'mb-8'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quick Start Templates</h3>
              <a
                href="/templates"
                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
              >
                View All Templates
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Create an advanced AI reasoning system with Think tools for JSON validation, output verification, and structured content generation using multiple AI agents.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white group-hover:text-primary transition-colors">Think Tool AI System</CardTitle>
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">⭐ Featured</span>
                      </div>
                      <CardDescription className="text-gray-400">Advanced AI reasoning with validation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Build a YouTube content curation system that automatically discovers, analyzes, and curates videos based on keywords with AI-powered quality scoring.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-lg">📝</span>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">YouTube Curator AI</CardTitle>
                      <CardDescription className="text-gray-400">Automated content discovery and curation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Create an infinite leads generation system that captures, scores, and nurtures leads automatically with multi-channel follow-up sequences.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-lg">💼</span>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">Infinite Leads Generator</CardTitle>
                      <CardDescription className="text-gray-400">Automated lead capture and nurturing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className="bg-gray-900 border-0 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handleSendMessage(
                  "Build a faceless content creation system that generates AI-powered videos, images, and text content for social media automation.",
                  []
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-lg">🎬</span>
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-primary transition-colors">Faceless Content Creator</CardTitle>
                      <CardDescription className="text-gray-400">AI-powered content generation</CardDescription>
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
