'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SignUpButton, SignInButton } from '@clerk/nextjs';

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="container mx-auto px-6 pt-32 pb-12">
        <article className="prose mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold mb-6">Meet NodePilot: The Simplest Way to Build Automations Without Writing a Single Line of Code</h1>
          <p className="text-gray-600 text-lg mb-8">
            If you've ever wanted to automate a repetitive task but felt overwhelmed by how complex it all seemed, you're not alone. Most automation tools are built for developers. NodePilot was built for everyone else.
          </p>
          <p className="text-gray-700 mb-8">
            NodePilot helps you describe what you want to automate in plain English—and then builds a working version of it for you. No setup. No confusing software. No coding.
          </p>
          <p className="text-gray-700 mb-12">
            It's your personal AI co-pilot for building powerful automations with clarity and speed.
          </p>
          <h2 className="text-2xl font-bold mb-4">What is NodePilot?</h2>
          <p className="text-gray-700 mb-8">
            NodePilot is an AI-powered tool that helps you create workflows for n8n, a popular no-code automation platform. But don't worry—if you've never heard of n8n, that's fine. You don't need to know how it works to use NodePilot.
          </p>
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Here's how it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>You describe what you want to automate</li>
              <li>NodePilot gives you the exact workflow setup</li>
              <li>You get step-by-step instructions along with a copy-ready version</li>
            </ol>
            <p className="mt-4 text-gray-500">It's designed to take you from idea to execution in minutes.</p>
          </div>
          <h2 className="text-2xl font-bold mb-4">Why NodePilot Exists</h2>
          <p className="text-gray-700 mb-4">
            Most people hit a wall when they try to automate something. Either the platform is too complicated, or they spend hours searching forums to figure it out.
          </p>
          <p className="text-gray-700 mb-8">
            NodePilot changes that by making automation accessible, fast, and actually helpful.
          </p>
          <ul className="list-none space-y-2 mb-8">
            <li className="flex items-center text-gray-700">
              <span className="text-primary mr-2">✓</span> Get instant workflow generation
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-primary mr-2">✓</span> Clear explanations for every step
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-primary mr-2">✓</span> Copy-ready n8n workflows
            </li>
          </ul>
          <div className="mt-12 flex justify-center gap-4">
            <SignUpButton mode="modal">
              <Button>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                Login
              </Button>
            </SignInButton>
          </div>
        </article>
      </main>
    </div>
  );
} 