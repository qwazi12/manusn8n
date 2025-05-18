"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function WorkflowsPage() {
  return (
    <>
      <SignedIn>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Workflows</h1>
            <p className="text-muted-foreground">View and manage your automation workflows</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No workflows yet</CardTitle>
              <CardDescription>
                Your generated workflows will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start by creating a new workflow from the dashboard or using the Create Workflow button.
              </p>
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