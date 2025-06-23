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

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get payment history
    const { data: paymentHistory, error: paymentError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Determine current plan
    let currentPlan = 'Free Trial';
    let status = 'trialing';
    let currentPeriodEnd = null;
    let cancelAtPeriodEnd = false;

    if (subscription && !subError) {
      currentPlan = subscription.plan_id || 'Unknown';
      status = subscription.status;
      currentPeriodEnd = subscription.current_period_end;
      cancelAtPeriodEnd = subscription.cancel_at_period_end;
    } else if (user.subscription_status === 'active') {
      currentPlan = user.subscription_plan || 'Unknown';
      status = user.subscription_status;
    }

    // Format plan name
    const formatPlanName = (planId: string) => {
      switch (planId) {
        case 'starter': return 'Starter';
        case 'pro': return 'Pro';
        case 'pay_as_you_go': return 'Pay-As-You-Go';
        case 'free_trial': return 'Free Trial';
        default: return planId;
      }
    };

    return NextResponse.json({
      plan: formatPlanName(currentPlan),
      status: status,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      credits: user.credits || 0,
      payment_history: paymentHistory || [],
    });

  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
