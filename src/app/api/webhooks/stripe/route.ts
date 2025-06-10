import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseAdmin);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabaseAdmin);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseAdmin);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseAdmin);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabaseAdmin);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseAdmin);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabaseAdmin);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const clerkId = session.metadata?.clerk_id;
  const supabaseUserId = session.metadata?.supabase_user_id;

  if (!clerkId || !supabaseUserId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Update user's subscription status
  if (session.mode === 'subscription') {
    await supabase
      .from('users')
      .update({
        plan: 'pro',
        subscription_status: 'active',
        subscription_id: session.subscription,
        credits: 500, // Pro plan gets 500 credits
      })
      .eq('id', supabaseUserId);

    // Record subscription in subscriptions table
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await supabase
        .from('subscriptions')
        .insert({
          user_id: supabaseUserId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          plan_type: 'pro',
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
        });
    }
  }

  // Handle one-time payments (PAYG credits)
  if (session.mode === 'payment' && session.payment_intent) {
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
    
    if (paymentIntent.metadata?.type === 'credit_purchase') {
      // Add credits to user account (100 credits for $5)
      const creditsToAdd = 100;
      
      await supabase
        .from('users')
        .update({
          credits: supabase.raw(`credits + ${creditsToAdd}`),
          total_credits_purchased: supabase.raw(`total_credits_purchased + ${creditsToAdd}`),
        })
        .eq('id', supabaseUserId);

      // Record payment
      await supabase
        .from('payments')
        .insert({
          user_id: supabaseUserId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          credits_purchased: creditsToAdd,
          description: 'PAYG Credit Purchase',
        });
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  // This is handled in checkout.session.completed
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  // Update user plan to free
  await supabase
    .from('users')
    .update({
      plan: 'free_user',
      subscription_status: 'inactive',
      subscription_id: null,
    })
    .eq('subscription_id', subscription.id);

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  if (invoice.subscription) {
    // Recurring payment - refresh credits for Pro users
    await supabase
      .from('users')
      .update({
        credits: 500, // Reset to 500 credits for Pro plan
        subscription_status: 'active',
      })
      .eq('subscription_id', invoice.subscription);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription, supabase: any) {
  // Send notification that trial is ending soon
  // You could implement email notifications here
  console.log('Trial will end for subscription:', subscription.id);

  // Update user record to indicate trial ending soon
  await supabase
    .from('users')
    .update({
      trial_ending_soon: true,
    })
    .eq('subscription_id', subscription.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  if (invoice.subscription) {
    // Mark subscription as past due
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
      })
      .eq('subscription_id', invoice.subscription);
  }
}
