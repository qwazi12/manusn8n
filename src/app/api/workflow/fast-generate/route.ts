import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fast workflow generation using pre-loaded node patterns and tips
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { prompt, user_id, conversation_id } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🚀 Fast workflow generation started');

    // Step 1: Get optimized AI prompts (2 seconds)
    const { data: aiPrompts } = await supabase
      .from('ai_prompts')
      .select('name, content')
      .eq('is_active', true)
      .in('name', ['fast_workflow_generator', 'main_prompt'])
      .order('name');

    // Step 2: Analyze prompt and get relevant node patterns (3 seconds)
    const nodeTypes = extractNodeTypesFromPrompt(prompt);
    const { data: nodePatterns } = await supabase
      .from('node_patterns')
      .select('node_type, node_name, node_config, use_case')
      .in('node_type', nodeTypes)
      .eq('is_featured', true)
      .limit(10);

    // Step 3: Get relevant tips (1 second)
    const { data: tips } = await supabase
      .from('workflow_tips')
      .select('tip_title, tip_content, category')
      .eq('is_active', true)
      .limit(5);

    // Step 4: Get matching template (2 seconds)
    const { data: templates } = await supabase
      .from('workflow_templates')
      .select('name, workflow_json, use_cases')
      .eq('is_active', true)
      .eq('is_public', true)
      .limit(3);

    // Step 5: Build optimized context for AI
    const optimizedContext = buildOptimizedContext({
      prompt,
      aiPrompts: aiPrompts || [],
      nodePatterns: nodePatterns || [],
      tips: tips || [],
      templates: templates || []
    });

    // Step 6: Generate workflow using optimized context (15-20 seconds)
    const workflow = await generateWorkflowFast(optimizedContext);

    // Step 7: Save generation record
    if (user_id && conversation_id) {
      await supabase
        .from('workflow_generations')
        .insert({
          user_id,
          conversation_id,
          prompt,
          workflow_json: workflow,
          generation_time_ms: Date.now() - startTime,
          model_used: 'fast_generator',
          status: 'completed'
        });
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Fast workflow generated in ${totalTime}ms`);

    return NextResponse.json({
      workflow,
      generation_time_ms: totalTime,
      optimization_used: true,
      node_patterns_used: nodePatterns?.length || 0,
      tips_applied: tips?.length || 0
    });

  } catch (error) {
    console.error('Fast workflow generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate workflow',
        generation_time_ms: Date.now() - startTime,
        optimization_used: false
      },
      { status: 500 }
    );
  }
}

// Extract likely node types from user prompt
function extractNodeTypesFromPrompt(prompt: string): string[] {
  const promptLower = prompt.toLowerCase();
  const nodeTypes: string[] = [];

  // Common patterns to node type mapping
  const patterns = {
    'http': ['n8n-nodes-base.httpRequest'],
    'api': ['n8n-nodes-base.httpRequest'],
    'google sheets': ['n8n-nodes-base.googleSheets'],
    'sheets': ['n8n-nodes-base.googleSheets'],
    'google docs': ['n8n-nodes-base.googleDocs'],
    'calendar': ['n8n-nodes-base.googleCalendar'],
    'telegram': ['n8n-nodes-base.telegram'],
    'chat': ['@n8n/n8n-nodes-langchain.chatTrigger', '@n8n/n8n-nodes-langchain.agent'],
    'ai': ['@n8n/n8n-nodes-langchain.agent', '@n8n/n8n-nodes-langchain.lmChatOpenAi'],
    'schedule': ['n8n-nodes-base.scheduleTrigger'],
    'webhook': ['n8n-nodes-base.webhook'],
    'email': ['n8n-nodes-base.gmail'],
    'database': ['n8n-nodes-base.postgres']
  };

  for (const [keyword, types] of Object.entries(patterns)) {
    if (promptLower.includes(keyword)) {
      nodeTypes.push(...types);
    }
  }

  // Always include common utility nodes
  nodeTypes.push(
    'n8n-nodes-base.set',
    'n8n-nodes-base.merge',
    'n8n-nodes-base.if'
  );

  return [...new Set(nodeTypes)]; // Remove duplicates
}

// Build optimized context for AI generation
function buildOptimizedContext(data: any) {
  const { prompt, aiPrompts, nodePatterns, tips, templates } = data;

  return {
    user_prompt: prompt,
    system_prompt: aiPrompts.find((p: any) => p.name === 'fast_workflow_generator')?.content || '',
    available_nodes: nodePatterns.map((np: any) => ({
      type: np.node_type,
      name: np.node_name,
      config: np.node_config,
      use_case: np.use_case
    })),
    optimization_tips: tips.map((t: any) => ({
      title: t.tip_title,
      content: t.tip_content,
      category: t.category
    })),
    template_examples: templates.map((t: any) => ({
      name: t.name,
      structure: t.workflow_json,
      use_cases: t.use_cases
    }))
  };
}

// Fast workflow generation using OpenAI with optimized context
async function generateWorkflowFast(context: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: context.system_prompt + '\n\nAvailable Node Patterns:\n' + 
                   JSON.stringify(context.available_nodes, null, 2) +
                   '\n\nOptimization Tips:\n' + 
                   context.optimization_tips.map((t: any) => `${t.title}: ${t.content}`).join('\n')
        },
        {
          role: 'user',
          content: `Generate a complete n8n workflow for: ${context.user_prompt}\n\nUse the provided node patterns for exact configurations. Respond with valid JSON only.`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 4000,
      timeout: 30000 // 30 second timeout
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const workflowContent = data.choices[0]?.message?.content;

  if (!workflowContent) {
    throw new Error('No workflow content generated');
  }

  // Parse and validate the workflow JSON
  try {
    return JSON.parse(workflowContent);
  } catch (error) {
    // Try to extract JSON from the response if it's wrapped in text
    const jsonMatch = workflowContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON generated');
  }
}
