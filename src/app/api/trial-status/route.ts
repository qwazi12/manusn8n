import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Use service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Get user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, credits, plan, trial_ends_at, created_at')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { credits, plan, trial_ends_at, created_at } = userData;
    const now = new Date();
    const trialEndDate = new Date(trial_ends_at);
    const createdDate = new Date(created_at);

    // 4. Calculate trial status
    const trialExpired = now > trialEndDate;
    const creditsExhausted = credits <= 0;
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const daysUsed = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // 5. Determine trial status
    let trialStatus: 'active' | 'expired' | 'credits_exhausted' | 'grace_period' = 'active';
    let canUseService = true;
    let upgradeRequired = false;
    let message = '';

    if (plan === 'pro' || plan === 'payg') {
      // User has a paid plan
      trialStatus = 'active';
      canUseService = true;
      upgradeRequired = false;
      message = `${plan === 'pro' ? 'Pro' : 'Pay-As-You-Go'} plan active`;
    } else if (creditsExhausted && trialExpired) {
      // Both credits and time expired
      trialStatus = 'expired';
      canUseService = false;
      upgradeRequired = true;
      message = 'Free trial expired. Please upgrade to continue using NodePilot.';
    } else if (creditsExhausted) {
      // Credits exhausted but time remaining
      trialStatus = 'credits_exhausted';
      canUseService = false;
      upgradeRequired = true;
      message = `Free trial credits exhausted. ${daysRemaining} days remaining - upgrade to continue.`;
    } else if (trialExpired) {
      // Time expired but credits remaining
      trialStatus = 'expired';
      canUseService = false;
      upgradeRequired = true;
      message = 'Free trial period ended. Please upgrade to continue using NodePilot.';
    } else if (daysRemaining <= 1 || credits <= 10) {
      // Grace period - warn user
      trialStatus = 'grace_period';
      canUseService = true;
      upgradeRequired = false;
      message = `Trial ending soon! ${daysRemaining} days and ${credits} credits remaining.`;
    } else {
      // Trial active
      trialStatus = 'active';
      canUseService = true;
      upgradeRequired = false;
      message = `Free trial active. ${daysRemaining} days and ${credits} credits remaining.`;
    }

    // 6. Return trial status
    return NextResponse.json({
      trial_status: trialStatus,
      can_use_service: canUseService,
      upgrade_required: upgradeRequired,
      message,
      details: {
        credits_remaining: credits,
        days_remaining: daysRemaining,
        days_used: daysUsed,
        trial_end_date: trial_ends_at,
        plan: plan,
        trial_expired: trialExpired,
        credits_exhausted: creditsExhausted
      }
    });

  } catch (error) {
    console.error('Trial status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
