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
      const { data: userData } = await supabase
        .from('users')
        .select('id, credits, plan')
        .eq('clerk_id', userId)
        .single();

      if (!userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { id: supabaseUserId, credits, plan } = userData;

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
      const { data: workflowData, error: workflowError } = await supabase
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
      const { error: creditError } = await supabase
        .from('users')
        .update({ credits: credits - 1 })
        .eq('id', supabaseUserId);

      if (creditError) {
        console.error('Error updating credits:', creditError);
        // Continue anyway since workflow was generated
      }

      // 10. Record credit usage for fallback
      const { error: historyError } = await supabase
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