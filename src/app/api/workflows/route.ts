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

    // 3. Get user's Supabase ID first
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabaseUserId = userData.id;

    // 4. Fetch user's workflows from workflow_generations table only (single source of truth)
    const { data: generations, error: generationsError } = await supabaseAdmin
      .from('workflow_generations')
      .select(`
        id,
        original_prompt,
        workflow_data,
        success,
        credits_used,
        created_at
      `)
      .eq('user_id', supabaseUserId)  // Use Supabase UUID consistently
      .eq('success', true)
      .order('created_at', { ascending: false });

    if (generationsError) {
      console.error('Error fetching workflow generations:', generationsError);
      return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
    }

    // Convert workflow_generations to standard workflows format
    const allWorkflows = (generations || []).map(gen => ({
      id: gen.id,
      title: `Generated: ${gen.original_prompt.substring(0, 50)}...`,
      description: `AI-generated workflow`,
      prompt: gen.original_prompt,
      workflow_json: gen.workflow_data,
      status: 'completed',
      credits_used: gen.credits_used,
      tags: ['ai-generated'],
      is_public: false,
      created_at: gen.created_at,
      updated_at: gen.created_at,
      source: 'enhanced_ai'
    }));

    // 5. Format workflows for frontend
    const formattedWorkflows = allWorkflows?.map(workflow => ({
      id: workflow.id,
      title: workflow.title || 'Untitled Workflow',
      description: workflow.description || workflow.prompt?.substring(0, 100) + '...',
      prompt: workflow.prompt,
      workflow_json: workflow.workflow_json,
      status: workflow.status,
      credits_used: workflow.credits_used,
      tags: workflow.tags || [],
      is_public: workflow.is_public,
      created_at: workflow.created_at,
      updated_at: workflow.updated_at,
      // Format dates for display
      created_date: new Date(workflow.created_at).toLocaleDateString(),
      created_time: new Date(workflow.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      // Calculate relative time
      relative_time: getRelativeTime(workflow.created_at)
    })) || [];

    // 6. Return workflows
    return NextResponse.json({
      workflows: formattedWorkflows,
      total: formattedWorkflows.length
    });

  } catch (error) {
    console.error('Workflows fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
