"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Star, CreditCard, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  credits: number;
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

const plans: PricingPlan[] = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    description: '7-day trial with 25 credits to explore NodePilot',
    price: 0,
    interval: '7 days',
    credits: 25,
    features: [
      '25 credits (7 days)',
      'Basic workflow generation',
      'Email support',
      'Export workflows'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'outline'
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals getting started with automation',
    price: 14,
    interval: 'month',
    credits: 300,
    features: [
      '300 credits/month',
      'Email support',
      'Workflow history',
      'Export workflows',
      'Basic templates'
    ],
    buttonText: 'Choose Starter',
    buttonVariant: 'outline'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Most popular plan for power users and small teams',
    price: 21,
    interval: 'month',
    credits: 500,
    popular: true,
    features: [
      '500 credits/month',
      'Priority support',
      'Advanced templates',
      'API access',
      'Workflow history',
      'Export workflows'
    ],
    buttonText: 'Choose Pro',
    buttonVariant: 'default'
  },
  {
    id: 'pay_as_you_go',
    name: 'Pay-As-You-Go',
    description: 'Buy credits as needed with no subscription',
    price: 8,
    interval: 'per 100 credits',
    credits: 100,
    features: [
      '100 credits per purchase',
      'No subscription',
      'Pay as you use',
      'Perfect for testing',
      'No commitment'
    ],
    buttonText: 'Buy Credits',
    buttonVariant: 'outline'
  }
];

export function StripePricingTable() {
  const { user, isSignedIn } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    if (!isSignedIn) {
      // Redirect to sign in
      window.location.href = '/sign-in?redirect_url=' + encodeURIComponent(window.location.href);
      return;
    }

    if (planId === 'free_trial') {
      // Free trial - redirect to dashboard
      window.location.href = '/dashboard';
      return;
    }

    setLoadingPlan(planId);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Error creating checkout session:', data.error);
        alert('Error creating checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pro': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'starter': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'pay_as_you_go': return <CreditCard className="h-5 w-5 text-green-500" />;
      default: return <Check className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your n8n workflow automation needs. All plans include AI-powered workflow generation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-2 border-primary shadow-lg scale-105' : 'border'}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getPlanIcon(plan.id)}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="text-3xl font-bold text-primary">
                  ${plan.price}
                  {plan.price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {plan.credits} credits {plan.interval !== 'per 100 credits' ? `per ${plan.interval}` : ''}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                variant={plan.buttonVariant}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={loadingPlan === plan.id}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">What's Included in All Plans</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🤖 AI-Powered Workflow Generation</h4>
              <p className="text-sm text-muted-foreground">
                Generate complete n8n workflows using advanced AI with access to comprehensive documentation
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔗 4000+ Integrations</h4>
              <p className="text-sm text-muted-foreground">
                Connect with Gmail, Slack, Airtable, and thousands of other services
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📚 Expert Guidance</h4>
              <p className="text-sm text-muted-foreground">
                Get help with complex automations, troubleshooting, and best practices
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Instant Export</h4>
              <p className="text-sm text-muted-foreground">
                Export generated workflows directly to your n8n instance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
