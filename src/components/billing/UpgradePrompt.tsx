"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Zap, Star, CreditCard } from 'lucide-react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'credits_low' | 'trial_expired' | 'feature_locked';
  creditsRemaining?: number;
  daysRemaining?: number;
}

export function UpgradePrompt({ 
  isOpen, 
  onClose, 
  reason = 'trial_expired',
  creditsRemaining = 0,
  daysRemaining = 0 
}: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getPromptContent = () => {
    switch (reason) {
      case 'credits_low':
        return {
          title: 'Running Low on Credits',
          description: `You have ${creditsRemaining} credits remaining. Upgrade to continue generating workflows.`,
          icon: <Zap className="h-6 w-6 text-yellow-500" />,
          urgency: 'medium'
        };
      case 'trial_expired':
        return {
          title: 'Trial Period Ended',
          description: 'Your 7-day free trial has ended. Upgrade to continue using NodePilot.',
          icon: <Star className="h-6 w-6 text-red-500" />,
          urgency: 'high'
        };
      case 'feature_locked':
        return {
          title: 'Premium Feature',
          description: 'This feature requires a paid plan. Upgrade to unlock advanced capabilities.',
          icon: <CreditCard className="h-6 w-6 text-blue-500" />,
          urgency: 'medium'
        };
      default:
        return {
          title: 'Upgrade Required',
          description: 'Upgrade your plan to continue using NodePilot.',
          icon: <Star className="h-6 w-6 text-blue-500" />,
          urgency: 'medium'
        };
    }
  };

  const handleUpgrade = async (planType: string) => {
    setIsLoading(true);
    try {
      // Redirect to Stripe pricing page with plan selection
      window.location.href = `/pricing?plan=${planType}`;
    } catch (error) {
      console.error('Error initiating upgrade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const content = getPromptContent();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {content.icon}
              <div>
                <CardTitle>{content.title}</CardTitle>
                <CardDescription>{content.description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Starter Plan */}
            <div className="border rounded-lg p-4 hover:border-primary transition-colors">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Starter</h3>
                <div className="text-2xl font-bold text-primary mt-2">$14</div>
                <div className="text-sm text-muted-foreground">per month</div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 300 credits/month
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Email support
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Workflow history
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Export workflows
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleUpgrade('starter')}
                  disabled={isLoading}
                >
                  Choose Starter
                </Button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-primary rounded-lg p-4 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Pro</h3>
                <div className="text-2xl font-bold text-primary mt-2">$21</div>
                <div className="text-sm text-muted-foreground">per month</div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 500 credits/month
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Priority support
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Advanced templates
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> API access
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  onClick={() => handleUpgrade('pro')}
                  disabled={isLoading}
                >
                  Choose Pro
                </Button>
              </div>
            </div>

            {/* Pay-As-You-Go */}
            <div className="border rounded-lg p-4 hover:border-primary transition-colors">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Pay-As-You-Go</h3>
                <div className="text-2xl font-bold text-primary mt-2">$8</div>
                <div className="text-sm text-muted-foreground">per 100 credits</div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> No subscription
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Pay as you use
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Perfect for testing
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> No commitment
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleUpgrade('pay_as_you_go')}
                  disabled={isLoading}
                >
                  Buy Credits
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include access to 4000+ integrations and AI-powered workflow generation
            </p>
            <Button variant="ghost" onClick={onClose} className="mt-2">
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
