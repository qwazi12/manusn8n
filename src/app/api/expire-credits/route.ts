import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// This endpoint should be called by a cron job daily to expire PAYG credits
export async function POST(request: Request) {
  try {
    // Verify this is called by a cron job (you might want to add authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find PAYG credit purchases older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: expiredPurchases, error: fetchError } = await supabaseAdmin
      .from('credit_history')
      .select('user_id, credits_amount, id')
      .eq('transaction_type', 'purchase')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .is('expired', null); // Only get non-expired purchases

    if (fetchError) {
      console.error('Error fetching expired purchases:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch expired purchases' }, { status: 500 });
    }

    if (!expiredPurchases || expiredPurchases.length === 0) {
      return NextResponse.json({ message: 'No credits to expire', expired_count: 0 });
    }

    let totalExpired = 0;
    const expiredUsers = new Set();

    // Process each expired purchase
    for (const purchase of expiredPurchases) {
      const { user_id, credits_amount, id } = purchase;

      // Get current user credits
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('credits, plan')
        .eq('id', user_id)
        .single();

      if (userError || !userData) {
        console.error(`Error fetching user ${user_id}:`, userError);
        continue;
      }

      // Only expire credits for PAYG users or free users
      if (userData.plan === 'pro') {
        continue; // Pro users don't have expiring credits
      }

      // Calculate credits to expire (don't go below 0)
      const creditsToExpire = Math.min(credits_amount, userData.credits);
      const newCredits = userData.credits - creditsToExpire;

      if (creditsToExpire > 0) {
        // Update user credits
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ credits: newCredits })
          .eq('id', user_id);

        if (updateError) {
          console.error(`Error updating credits for user ${user_id}:`, updateError);
          continue;
        }

        // Record credit expiration in history
        const { error: historyError } = await supabaseAdmin
          .from('credit_history')
          .insert({
            user_id: user_id,
            transaction_type: 'refund', // Using refund type for expiration
            credits_amount: -creditsToExpire,
            credits_before: userData.credits,
            credits_after: newCredits,
            description: `PAYG credits expired (30 days) - ${creditsToExpire} credits`
          });

        if (historyError) {
          console.error(`Error recording expiration for user ${user_id}:`, historyError);
        }

        // Mark the original purchase as expired
        const { error: markExpiredError } = await supabaseAdmin
          .from('credit_history')
          .update({ expired: true })
          .eq('id', id);

        if (markExpiredError) {
          console.error(`Error marking purchase ${id} as expired:`, markExpiredError);
        }

        totalExpired += creditsToExpire;
        expiredUsers.add(user_id);
      }
    }

    return NextResponse.json({
      message: 'Credit expiration completed',
      expired_count: totalExpired,
      affected_users: expiredUsers.size,
      processed_purchases: expiredPurchases.length
    });

  } catch (error) {
    console.error('Credit expiration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
