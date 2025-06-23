import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stripe Product and Price IDs
const STRIPE_PRODUCTS = {
  starter: 'prod_SYO0OTVNV9inJS',
  pro: 'prod_SYO0uvEhOoc2xp',
  credits: 'prod_SYO0QudWpC1X9b'
};

const STRIPE_PRICES = {
  starter: 'price_1RdHEaKgH5HMzGLedHZj5J04',
  pro: 'price_1RdHEaKgH5HMzGLe2XsFGQGW',
  credits: 'price_1RdHEbKgH5HMzGLeORcbP045'
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, successUrl, cancelUrl } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let stripeCustomer;
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (existingCustomer) {
      stripeCustomer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id);
    } else {
      // Create new Stripe customer
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email,
        metadata: {
          user_id: user.id,
          clerk_id: userId,
        },
      });

      // Save to database
      await supabase.from('stripe_customers').insert({
        user_id: user.id,
        stripe_customer_id: stripeCustomer.id,
        email: user.email,
        name: user.full_name || user.email,
      });
    }

    // Get price based on plan
    let priceId: string;
    let mode: 'subscription' | 'payment' = 'subscription';

    switch (planId) {
      case 'starter':
        priceId = STRIPE_PRICES.starter;
        break;

      case 'pro':
        priceId = STRIPE_PRICES.pro;
        break;

      case 'pay_as_you_go':
        mode = 'payment';
        priceId = STRIPE_PRICES.credits;
        break;

      default:
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      automatic_tax: {
        enabled: true, // Enable automatic tax as requested
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        clerk_id: userId,
        plan_id: planId,
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          user_id: user.id,
          clerk_id: userId,
          plan_id: planId,
        },
      } : undefined,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
