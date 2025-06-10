import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: Request) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Parse request body
    const { priceId, mode, successUrl, cancelUrl } = await request.json();

    if (!priceId || !mode || !successUrl || !cancelUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields: priceId, mode, successUrl, cancelUrl' 
      }, { status: 400 });
    }

    // 3. Use service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Get or create user in Supabase
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, stripe_customer_id, email')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = userData.stripe_customer_id;

    // 5. Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          clerk_id: userId,
          supabase_id: userData.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userData.id);
    }

    // 6. Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerk_id: userId,
        supabase_user_id: userData.id,
      },
      // For subscriptions, add trial period if needed
      ...(mode === 'subscription' && {
        subscription_data: {
          metadata: {
            clerk_id: userId,
            supabase_user_id: userData.id,
          },
        },
      }),
      // For one-time payments (PAYG), add metadata
      ...(mode === 'payment' && {
        payment_intent_data: {
          metadata: {
            clerk_id: userId,
            supabase_user_id: userData.id,
            type: 'credit_purchase',
          },
        },
      }),
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    });

  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
