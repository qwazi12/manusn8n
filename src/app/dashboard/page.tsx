"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <SignedIn>
        <div className="flex flex-col gap-6 mt-16">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Create Workflow</h1>
            <p className="text-gray-500 text-sm">Generate a new n8n automation workflow using AI</p>
          </div>

          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What would you like to automate?</CardTitle>
              <CardDescription>
                Describe your automation needs in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I want to automatically save new Gmail attachments to Google Drive and notify me on Slack"
                className="min-h-[120px] resize-none"
              />
              <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                Generate Workflow
              </Button>
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">100 credits</span>
              </div>
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
