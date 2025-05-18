"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateWorkflowPage() {
  return (
    <>
      <SignedIn>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Workflow</h1>
            <p className="text-muted-foreground">Generate a new n8n automation workflow using AI</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What would you like to automate?</CardTitle>
              <CardDescription>
                Describe your automation needs in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I want to automatically save new Gmail attachments to Google Drive and notify me on Slack"
                className="min-h-[120px]"
              />
              <Button className="w-full">Generate Workflow</Button>
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