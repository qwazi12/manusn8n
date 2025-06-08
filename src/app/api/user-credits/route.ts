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

    // 3. Get user's current credits from Supabase
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, credits, plan, trial_ends_at, created_at')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Calculate trial status for minimal warnings
    const now = new Date();
    const trialEndDate = new Date(userData.trial_ends_at);
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const trialExpired = now > trialEndDate;
    const creditsExhausted = userData.credits <= 0;

    // 5. Determine if warnings are needed
    const showGraceWarning = (daysRemaining <= 1 || userData.credits <= 10) && !trialExpired && !creditsExhausted;
    const showBlockingModal = (trialExpired || creditsExhausted) && userData.plan === 'free_user';

    // 6. Return credit information
    return NextResponse.json({
      credits: userData.credits,
      plan: userData.plan,
      trial_status: {
        days_remaining: daysRemaining,
        trial_expired: trialExpired,
        credits_exhausted: creditsExhausted,
        show_grace_warning: showGraceWarning,
        show_blocking_modal: showBlockingModal
      }
    });

  } catch (error) {
    console.error('User credits fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
