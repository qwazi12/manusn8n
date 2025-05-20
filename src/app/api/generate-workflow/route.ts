import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Helper to check if trial has expired
function hasTrialExpired(trialStart: string) {
  const trialDate = new Date(trialStart);
  const now = new Date();
  const daysSinceTrial = Math.floor((now.getTime() - trialDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceTrial > 7; // 7-day trial
}

export async function POST(request: Request) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Get request body
    const { prompt, files = [] } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 3. Initialize Supabase client
    const supabase = createClient();

    // 4. Get user data from Clerk
    const user = await clerkClient.users.getUser(userId);
    const trialStart = user.publicMetadata.trialStart as string;

    // 5. Check credits and trial status
    const { data: userData } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { credits, plan } = userData;

    // Check if user has credits or is in trial period
    if (credits <= 0 && (plan === 'free' && hasTrialExpired(trialStart))) {
      return NextResponse.json(
        { 
          error: 'No credits remaining', 
          upgrade_url: '/pricing'
        }, 
        { status: 403 }
      );
    }

    // 6. Generate workflow (placeholder for now)
    // TODO: Implement actual workflow generation with OpenAI/Claude
    const workflow = {
      nodes: [],
      connections: [],
      // ... generated workflow JSON
    };

    // 7. Insert workflow into database
    const { data: workflowData, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: userId,
        prompt,
        json: workflow,
        status: 'completed',
        credits_used: 1,
        file_urls: files
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Error inserting workflow:', workflowError);
      return NextResponse.json({ error: 'Failed to save workflow' }, { status: 500 });
    }

    // 8. Deduct credit and update history
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: credits - 1 })
      .eq('id', userId);

    if (creditError) {
      console.error('Error updating credits:', creditError);
      // Continue anyway since workflow was generated
    }

    // 9. Record credit usage
    const { error: historyError } = await supabase
      .from('credit_history')
      .insert({
        user_id: userId,
        action: 'generation',
        amount: -1,
        workflow_id: workflowData.id
      });

    if (historyError) {
      console.error('Error recording credit history:', historyError);
      // Continue anyway since workflow was generated
    }

    // 10. Return success response
    return NextResponse.json({
      workflow,
      message: 'success',
      remaining_credits: credits - 1
    });

  } catch (error) {
    console.error('Workflow generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 