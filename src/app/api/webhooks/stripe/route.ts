import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

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

    console.log('Processing Stripe webhook:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId) {
    console.error('No user_id in checkout session metadata');
    return;
  }

  // Handle one-time payments (Pay-as-you-go)
  if (session.mode === 'payment') {
    // Add credits to user account
    const creditsToAdd = planId === 'pay_as_you_go' ? 100 : 0;
    
    await supabase
      .from('users')
      .update({ 
        credits: supabase.raw(`credits + ${creditsToAdd}`)
      })
      .eq('id', userId);

    // Record payment
    await supabase.from('payment_history').insert({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount_cents: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'succeeded',
      description: `Credits purchase - ${creditsToAdd} credits`,
    });

    console.log(`Added ${creditsToAdd} credits to user ${userId}`);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const userId = subscription.metadata?.user_id;
  const planId = subscription.metadata?.plan_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Create subscription record
  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan_id: planId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  });

  // Update user subscription status
  await supabase
    .from('users')
    .update({ 
      subscription_status: subscription.status,
      subscription_plan: planId,
    })
    .eq('id', userId);

  // Add monthly credits based on plan
  const creditsToAdd = planId === 'starter' ? 300 : planId === 'pro' ? 500 : 0;
  if (creditsToAdd > 0) {
    await supabase
      .from('users')
      .update({ 
        credits: supabase.raw(`credits + ${creditsToAdd}`)
      })
      .eq('id', userId);
  }

  console.log(`Created subscription for user ${userId} with plan ${planId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update user status
  const userId = subscription.metadata?.user_id;
  if (userId) {
    await supabase
      .from('users')
      .update({ 
        subscription_status: subscription.status,
      })
      .eq('id', userId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update user status
  const userId = subscription.metadata?.user_id;
  if (userId) {
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'canceled',
        subscription_plan: null,
      })
      .eq('id', userId);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end:', subscription.id);
  
  // You can implement email notifications here
  // For now, just log the event
  const userId = subscription.metadata?.user_id;
  console.log(`Trial ending soon for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Get subscription to find user
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, plan_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) return;

  // Record payment
  await supabase.from('payment_history').insert({
    user_id: subscription.user_id,
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: `Subscription payment - ${subscription.plan_id}`,
  });

  // Add monthly credits
  const creditsToAdd = subscription.plan_id === 'starter' ? 300 : subscription.plan_id === 'pro' ? 500 : 0;
  if (creditsToAdd > 0) {
    await supabase
      .from('users')
      .update({ 
        credits: supabase.raw(`credits + ${creditsToAdd}`)
      })
      .eq('id', subscription.user_id);
  }

  console.log(`Payment processed for user ${subscription.user_id}, added ${creditsToAdd} credits`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Get subscription to find user
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, plan_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) return;

  // Record failed payment
  await supabase.from('payment_history').insert({
    user_id: subscription.user_id,
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    description: `Failed subscription payment - ${subscription.plan_id}`,
  });

  console.log(`Payment failed for user ${subscription.user_id}`);
}
