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
    const { returnUrl } = await request.json();

    if (!returnUrl) {
      return NextResponse.json({ 
        error: 'Missing required field: returnUrl' 
      }, { status: 400 });
    }

    // 3. Use service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Get user's Stripe customer ID
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('clerk_id', userId)
      .single();

    if (!userData || !userData.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No billing account found. Please subscribe first.' 
      }, { status: 404 });
    }

    // 5. Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ 
      url: portalSession.url 
    });

  } catch (error: any) {
    console.error('Portal session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
