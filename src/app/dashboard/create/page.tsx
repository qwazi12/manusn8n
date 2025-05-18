"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function CreateWorkflowPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName("");
      setDescription("");
    }, 1200);
  };

  return (
    <>
      <SignedIn>
        <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-xl bg-[#181818] border border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Create a New Workflow</CardTitle>
              <CardDescription className="text-gray-400">
                Enter a name and description for your workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="workflow-name" className="block mb-1 text-sm font-medium text-gray-300">
                    Workflow Name
                  </label>
                  <input
                    id="workflow-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-salmon-500"
                    placeholder="e.g. Social Media Scheduler"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="workflow-description" className="block mb-1 text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="workflow-description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-black text-white px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-salmon-500"
                    placeholder="Describe what this workflow does..."
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-salmon-500 hover:bg-salmon-600 text-white">
                  {loading ? "Creating..." : "Create Workflow"}
                </Button>
                {success && <div className="text-green-400 text-center">Workflow created!</div>}
              </form>
            </CardContent>
          </Card>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
} 