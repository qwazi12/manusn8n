"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@clerk/nextjs';
import { loadStripe } from '@stripe/stripe-js';

interface PaygCreditPurchaseProps {
  currentCredits: number;
  onPurchaseComplete?: (newCredits: number) => void;
}

export function PaygCreditPurchase({ currentCredits, onPurchaseComplete }: PaygCreditPurchaseProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number>(100);
  const { has } = useAuth();

  const creditPackages = [
    { credits: 100, price: 5, popular: true },
    { credits: 250, price: 12, savings: '$0.50' },
    { credits: 500, price: 22, savings: '$3.00' },
    { credits: 1000, price: 40, savings: '$10.00' }
  ];

  const handlePurchase = async (credits: number) => {
    setIsLoading(true);
    try {
      // In a real implementation, you would:
      // 1. Create Stripe payment intent
      // 2. Show Stripe checkout
      // 3. Handle payment success
      // 4. Call our purchase-credits API
      
      // For now, simulate the purchase
      console.log(`Purchasing ${credits} credits for $${credits === 100 ? 5 : credits * 0.045}`);
      
      // Create Stripe checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1RR1a1KgH5HMzGLeTCXYKfOC', // PAYG credits price ID
          mode: 'payment',
          successUrl: `${window.location.origin}/dashboard?purchase=success`,
          cancelUrl: `${window.location.origin}/pricing?purchase=cancelled`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RQWb6KgH5HMzGLeQUlIUbxA0WBJOJOLKFikKvkTqofKyCXPrFbQfB9S4ygzq8FDrQkQyRc21rrCIbw0f01Bnb5300hVQxDtiX');
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for PAYG users or users without a plan
  const hasPaygPlan = has({ plan: 'payg' });
  const hasProPlan = has({ plan: 'pro' });
  
  if (hasProPlan) {
    return null; // Pro users don't need to buy credits
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Credits</h2>
        <p className="text-gray-600">
          Current balance: <span className="font-semibold">{currentCredits} credits</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Credits expire 30 days after purchase
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditPackages.map((pkg) => (
          <Card 
            key={pkg.credits}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPackage === pkg.credits ? 'ring-2 ring-primary' : ''
            } ${pkg.popular ? 'border-primary' : ''}`}
            onClick={() => setSelectedPackage(pkg.credits)}
          >
            <CardHeader className="text-center pb-2">
              {pkg.popular && (
                <div className="bg-primary text-white text-xs px-2 py-1 rounded-full mb-2">
                  Most Popular
                </div>
              )}
              <CardTitle className="text-lg">{pkg.credits} Credits</CardTitle>
              <CardDescription className="text-2xl font-bold text-gray-900">
                ${pkg.price}
              </CardDescription>
              {pkg.savings && (
                <p className="text-sm text-green-600 font-medium">
                  Save {pkg.savings}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  ${(pkg.price / pkg.credits).toFixed(3)} per credit
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(pkg.credits);
                  }}
                  disabled={isLoading}
                  className="w-full"
                  variant={selectedPackage === pkg.credits ? "default" : "outline"}
                >
                  {isLoading ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Pay-As-You-Go Benefits:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• No monthly subscription required</li>
          <li>• Perfect for occasional users</li>
          <li>• All standard generation features included</li>
          <li>• Credits expire after 30 days</li>
          <li>• Secure payment processing via Stripe</li>
        </ul>
      </div>
    </div>
  );
}
