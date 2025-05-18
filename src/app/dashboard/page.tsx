"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { usePricing } from "@/hooks/usePricing";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { 
    remainingCredits, 
    getCurrentPlan,
    getTrialStatus,
  } = usePricing();

  const currentPlan = getCurrentPlan();
  const trialStatus = getTrialStatus();

  return (
    <>
      <SignedIn>
        <div className="container mx-auto py-12">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to NodePilot</h1>
              <p className="text-muted-foreground">Your AI-powered n8n automation platform</p>
            </div>

            {trialStatus?.isActive && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Trial Status</CardTitle>
                  </div>
                  <CardDescription>
                    Your free trial ends in {trialStatus.daysLeft} days. Upgrade to continue using NodePilot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/#pricing">Upgrade Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate a Workflow</CardTitle>
                  <CardDescription>Create a new automation workflow with AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/create">Start Creating</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Workflows</CardTitle>
                  <CardDescription>View and manage your existing workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/workflows">View Workflows</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Plan: {currentPlan.name}</CardTitle>
                  <CardDescription>
                    {currentPlan.interval === 'month' 
                      ? `$${currentPlan.price}/month` 
                      : currentPlan.interval === 'credits'
                      ? `$${currentPlan.price}/${currentPlan.credits} credits`
                      : 'Free Trial'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/#pricing">
                      {currentPlan.id === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Credits</CardTitle>
                  <CardDescription>
                    You have {remainingCredits} credits remaining on your {currentPlan.name} plan
                    {currentPlan.creditExpiry && ` (expires in ${currentPlan.creditExpiry} days)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (remainingCredits / currentPlan.credits) * 100)}%` 
                      }} 
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>0</span>
                    <span>{currentPlan.credits} credits</span>
                  </div>
                </CardContent>
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
