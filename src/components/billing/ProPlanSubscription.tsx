"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUser } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ProPlanSubscriptionProps {
  currentPlan?: string;
  onSubscriptionSuccess?: () => void;
}

export function ProPlanSubscription({ currentPlan, onSubscriptionSuccess }: ProPlanSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { has } = useAuth();

  const hasProPlan = has({ plan: 'pro' });

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please sign in to subscribe');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RR1V2KgH5HMzGLe3fBICnDV', // Pro Plan price ID
          mode: 'subscription',
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

    } catch (error: any) {
      console.error('Subscription error:', error);
      setError(error.message || 'Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (error: any) {
      console.error('Portal error:', error);
      setError(error.message || 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle className="text-2xl">Pro Plan</CardTitle>
          {hasProPlan && (
            <Badge className="bg-green-100 text-green-800">Current Plan</Badge>
          )}
        </div>
        <CardDescription>
          Monthly subscription with premium features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="text-center">
          <div className="text-3xl font-bold">$17.99</div>
          <div className="text-sm text-gray-500">per month</div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">500 credits per month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Priority AI processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Upload files/images for smarter prompts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Retain workflows permanently</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Multi-turn refinement chat</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-2">
          {hasProPlan ? (
            <Button 
              onClick={handleManageSubscription}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          ) : (
            <Button 
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : 'Subscribe to Pro Plan'}
            </Button>
          )}
          
          {!hasProPlan && (
            <p className="text-xs text-gray-500 text-center">
              Cancel anytime. No long-term commitments.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
