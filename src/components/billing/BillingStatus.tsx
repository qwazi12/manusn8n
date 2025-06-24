"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BillingInfo {
  plan: string | null;
  features: string[];
  credits: number;
  subscription_status: string | null;
  trial_status: any;
}

export function BillingStatus() {
  const { user } = useUser();
  const { has } = useAuth();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    try {
      const response = await fetch('/api/billing/status');
      if (response.ok) {
        const data = await response.json();
        setBillingInfo(data);
      }
    } catch (error) {
      console.error('Error fetching billing info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check user's current plan using Clerk's has() method
  const hasFreeTrial = has({ plan: 'free_trial' });
  const hasStarterPlan = has({ plan: 'starter' });
  const hasProPlan = has({ plan: 'pro' });
  const hasPayAsYouGo = has({ plan: 'pay_as_you_go' });

  // Determine current plan
  const getCurrentPlan = () => {
    if (hasProPlan) return 'Pro';
    if (hasStarterPlan) return 'Starter';
    if (hasPayAsYouGo) return 'Pay-As-You-Go';
    if (hasFreeTrial) return 'Free Trial';
    return 'Free Trial'; // Default
  };

  // Get plan color
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Pro': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Starter': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Pay-As-You-Go': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Current Plan
              <Badge className={`text-white ${getPlanColor(currentPlan)}`}>
                {currentPlan}
              </Badge>
            </CardTitle>
            <CardDescription>
              {billingInfo?.credits !== undefined ? `${billingInfo.credits} credits remaining` : 'Loading credits...'}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/clerk-pricing'}
          >
            {currentPlan === 'Free Trial' ? 'Upgrade Plan' : 'Manage Plan'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Plan Features */}
          <div>
            <h4 className="text-sm font-medium mb-2">Plan Features:</h4>
            <div className="grid grid-cols-1 gap-1">
              {currentPlan === 'Pro' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> 500 credits/month
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Priority support
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Advanced templates
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> API access
                  </div>
                </>
              )}
              
              {currentPlan === 'Starter' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> 300 credits/month
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Email support
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Workflow history
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Export workflows
                  </div>
                </>
              )}
              
              {currentPlan === 'Free Trial' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> 25 credits (7 days)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Basic workflow generation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Email support
                  </div>
                </>
              )}
              
              {currentPlan === 'Pay-As-You-Go' && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> $8 per 100 credits
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> No subscription
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-green-500">✓</span> Pay as you use
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trial Status */}
          {billingInfo?.trial_status && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trial Status:</span>
                <Badge variant={billingInfo.trial_status.is_active ? "default" : "secondary"}>
                  {billingInfo.trial_status.is_active ? "Active" : "Expired"}
                </Badge>
              </div>
              {billingInfo.trial_status.days_remaining !== undefined && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Days Remaining:</span>
                  <span className="font-medium">{billingInfo.trial_status.days_remaining}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
