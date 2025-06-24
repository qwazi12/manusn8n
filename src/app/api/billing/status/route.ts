import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Calculate trial status
    const trialStartDate = new Date(user.trial_start_date);
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
    
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isTrialActive = now < trialEndDate && user.credits > 0;

    const trialStatus = {
      is_active: isTrialActive,
      days_remaining: daysRemaining,
      credits_remaining: user.credits,
      trial_end_date: trialEndDate.toISOString(),
      show_warning: daysRemaining <= 1 || user.credits <= 10,
      show_blocking_modal: !isTrialActive && user.subscription_status !== 'active'
    };

    // Determine current plan based on subscription status
    let currentPlan = 'free_trial';
    const features: string[] = [];

    if (user.subscription_status === 'active') {
      // Check subscription type from Stripe/Clerk
      switch (user.subscription_plan) {
        case 'starter':
          currentPlan = 'starter';
          features.push('300 credits/month', 'Email support', 'Workflow history', 'Export workflows');
          break;
        case 'pro':
          currentPlan = 'pro';
          features.push('500 credits/month', 'Priority support', 'Advanced templates', 'API access');
          break;
        case 'pay_as_you_go':
          currentPlan = 'pay_as_you_go';
          features.push('$8 per 100 credits', 'No subscription', 'Pay as you use');
          break;
        default:
          currentPlan = 'free_trial';
          features.push('25 credits (7 days)', 'Basic workflow generation', 'Email support');
      }
    } else {
      // Free trial
      features.push('25 credits (7 days)', 'Basic workflow generation', 'Email support');
    }

    return NextResponse.json({
      plan: currentPlan,
      features,
      credits: user.credits,
      subscription_status: user.subscription_status,
      trial_status: trialStatus,
      user_id: user.id
    });

  } catch (error) {
    console.error('Error fetching billing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
