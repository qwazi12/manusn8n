import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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
    console.log('🔍 DEBUG: Clerk User ID:', userId);

    // 2. Get request body
    const { prompt, files = [] } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 3. Call the backend Express server to generate workflow
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/api/workflows/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`, // Pass user ID as auth
        },
        body: JSON.stringify({
          prompt,
          files,
          useCache: true
        }),
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        console.error('Backend error:', backendData);
        return NextResponse.json(
          { error: backendData.error || 'Failed to generate workflow' },
          { status: backendResponse.status }
        );
      }

      // Return the backend response directly
      return NextResponse.json({
        workflow: backendData.workflow,
        message: backendData.message,
        remaining_credits: backendData.remaining_credits,
        workflow_id: backendData.workflow_id
      });

    } catch (backendError) {
      console.error('Error calling backend:', backendError);
      
      // Fallback: Generate a mock workflow if backend is unavailable
      console.log('Backend unavailable, generating mock workflow...');
      
      // 4. Initialize Supabase client for fallback
      const supabase = createClient();

      // 5. Get user data from Clerk for fallback
      const user = await clerkClient.users.getUser(userId);
      const trialStart = user.publicMetadata.trialStart as string;

      // 6. Check credits and trial status for fallback
      console.log('🔍 DEBUG: Looking up user with clerk_id:', userId);

      // Use service role key to bypass RLS
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, credits, plan, clerk_id, email, trial_ends_at, created_at')
        .eq('clerk_id', userId)
        .single();

      console.log('🔍 DEBUG: User lookup result:', { userData, userError });

      if (!userData) {
        console.log('❌ DEBUG: User not found in Supabase, attempting to create...');

        // Try to create the user if they don't exist
        const user = await clerkClient.users.getUser(userId);
        const primaryEmail = user.emailAddresses[0]?.emailAddress;

        if (!primaryEmail) {
          return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
        }

        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: userId,
            email: primaryEmail,
            first_name: user.firstName || null,
            last_name: user.lastName || null,
            plan: 'free_user',
            credits: 100
          })
          .select('id, credits, plan')
          .single();

        if (createError) {
          console.log('❌ DEBUG: Failed to create user:', createError);
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        console.log('✅ DEBUG: Created new user:', newUser);
        userData = newUser;
      }

      const { id: supabaseUserId, credits, plan, trial_ends_at } = userData;

      // Check trial status and credits
      const now = new Date();
      const trialEndDate = new Date(trial_ends_at);
      const trialExpired = now > trialEndDate;
      const creditsExhausted = credits <= 0;

      // Enforce trial limits for free users
      if (plan === 'free_user') {
        if (trialExpired && creditsExhausted) {
          return NextResponse.json({
            error: 'Free trial expired',
            message: 'Your free trial has ended and you have no credits remaining. Please upgrade to Pro or purchase credits to continue.',
            upgrade_required: true,
            upgrade_url: '/pricing'
          }, { status: 402 });
        } else if (creditsExhausted) {
          return NextResponse.json({
            error: 'No credits remaining',
            message: 'You have no credits left. Please upgrade to Pro or purchase credits to continue.',
            upgrade_required: true,
            upgrade_url: '/pricing'
          }, { status: 402 });
        } else if (trialExpired) {
          return NextResponse.json({
            error: 'Trial period ended',
            message: 'Your 7-day trial has ended. Please upgrade to Pro or purchase credits to continue.',
            upgrade_required: true,
            upgrade_url: '/pricing'
          }, { status: 402 });
        }
      }

      // Check credits for all users
      if (credits <= 0) {
        return NextResponse.json({
          error: 'No credits remaining',
          message: 'You have no credits left. Please purchase more credits or upgrade to Pro.',
          upgrade_required: true,
          upgrade_url: '/pricing'
        }, { status: 402 });
      }

      // 7. Generate mock workflow for fallback
      const mockWorkflow = {
        nodes: [
          {
            id: 'start',
            type: 'n8n-nodes-base.start',
            position: [100, 300],
            parameters: {},
            name: 'Start'
          },
          {
            id: 'webhook',
            type: 'n8n-nodes-base.webhook',
            position: [300, 300],
            parameters: {
              path: 'workflow-trigger',
              httpMethod: 'POST'
            },
            name: 'Webhook'
          },
          {
            id: 'function',
            type: 'n8n-nodes-base.function',
            position: [500, 300],
            parameters: {
              functionCode: `// Process the incoming data
return items.map(item => {
  return {
    json: {
      ...item.json,
      processed: true,
      timestamp: new Date().toISOString()
    }
  };
});`
            },
            name: 'Process Data'
          }
        ],
        connections: {
          'Start': {
            'main': [
              [
                {
                  'node': 'Webhook',
                  'type': 'main',
                  'index': 0
                }
              ]
            ]
          },
          'Webhook': {
            'main': [
              [
                {
                  'node': 'Process Data',
                  'type': 'main',
                  'index': 0
                }
              ]
            ]
          }
        }
      };

      // 8. Insert workflow into database for fallback
      const { data: workflowData, error: workflowError } = await supabaseAdmin
        .from('workflows')
        .insert({
          user_id: supabaseUserId,
          title: prompt.substring(0, 100), // Use first 100 chars as title
          prompt,
          workflow_json: mockWorkflow,
          status: 'completed',
          credits_used: 1
        })
        .select()
        .single();

      if (workflowError) {
        console.error('Error inserting workflow:', workflowError);
        return NextResponse.json({ error: 'Failed to save workflow' }, { status: 500 });
      }

      // 9. Deduct credit and update history for fallback
      const { error: creditError } = await supabaseAdmin
        .from('users')
        .update({ credits: credits - 1 })
        .eq('id', supabaseUserId);

      if (creditError) {
        console.error('Error updating credits:', creditError);
        // Continue anyway since workflow was generated
      }

      // 10. Record credit usage for fallback
      const { error: historyError } = await supabaseAdmin
        .from('credit_history')
        .insert({
          user_id: supabaseUserId,
          transaction_type: 'usage',
          credits_amount: -1,
          credits_before: credits,
          credits_after: credits - 1,
          description: 'Workflow generation',
          workflow_id: workflowData.id
        });

      if (historyError) {
        console.error('Error recording credit history:', historyError);
        // Continue anyway since workflow was generated
      }

      // 11. Return fallback response
      return NextResponse.json({
        workflow: mockWorkflow,
        message: 'Workflow generated (backend unavailable - using mock)',
        remaining_credits: credits - 1,
        workflow_id: workflowData.id
      });
    }

  } catch (error) {
    console.error('Workflow generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 