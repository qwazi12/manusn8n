import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Get request body
    const { credits_amount, payment_intent_id } = await request.json();
    
    if (!credits_amount || !payment_intent_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Use service role key to bypass RLS
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Get user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, credits')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: supabaseUserId, credits: currentCredits } = userData;
    const newCredits = currentCredits + credits_amount;

    // 5. Update user credits
    const { error: creditError } = await supabaseAdmin
      .from('users')
      .update({ 
        credits: newCredits,
        total_credits_purchased: newCredits // Track total purchased
      })
      .eq('id', supabaseUserId);

    if (creditError) {
      console.error('Error updating credits:', creditError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // 6. Record payment in payments table
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: supabaseUserId,
        stripe_payment_intent_id: payment_intent_id,
        amount: credits_amount === 100 ? 500 : credits_amount * 5, // $5 per 100 credits
        currency: 'usd',
        status: 'succeeded',
        payment_method: 'card',
        description: `PAYG Credit Purchase - ${credits_amount} credits`,
        credits_purchased: credits_amount
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      // Continue anyway since credits were added
    }

    // 7. Record credit history
    const { error: historyError } = await supabaseAdmin
      .from('credit_history')
      .insert({
        user_id: supabaseUserId,
        transaction_type: 'purchase',
        credits_amount: credits_amount,
        credits_before: currentCredits,
        credits_after: newCredits,
        description: `PAYG Credit Purchase - ${credits_amount} credits`,
        stripe_payment_intent_id: payment_intent_id
      });

    if (historyError) {
      console.error('Error recording credit history:', historyError);
      // Continue anyway since credits were added
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      credits_purchased: credits_amount,
      new_credit_balance: newCredits,
      message: `Successfully purchased ${credits_amount} credits`
    });

  } catch (error) {
    console.error('Credit purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
