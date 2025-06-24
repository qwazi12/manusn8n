import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    // 2. Get request body (handle both JSON and FormData for file uploads)
    let message: string;
    let conversationId: string | undefined;
    let files: File[] = [];

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // Handle file uploads
      const formData = await request.formData();
      message = formData.get('message') as string;
      conversationId = formData.get('conversationId') as string;

      // Extract files
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('file_') && value instanceof File) {
          files.push(value);
        }
      }
    } else {
      // Handle regular JSON
      const body = await request.json();
      message = body.message;
      conversationId = body.conversationId;
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 3. Handle conversation creation/retrieval
    let currentConversationId = conversationId;

    if (!currentConversationId) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      currentConversationId = newConversation.id;
    }

    // 4. Process files if any
    let fileContext = '';
    if (files.length > 0) {
      fileContext = await processFiles(files);
      message = `${message}\n\n[Files attached: ${files.map(f => f.name).join(', ')}]\n${fileContext}`;
    }

    // 5. Save user message to conversation
    const { error: userMsgError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: userId,
        role: 'user',
        content: message,
        metadata: {
          hasFiles: files.length > 0,
          fileNames: files.map(f => f.name),
          fileCount: files.length
        }
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    // 5. Check if this is a workflow generation request and use fast generation
    const isWorkflowRequest = isWorkflowGenerationRequest(message);
    let data: any;

    if (isWorkflowRequest) {
      console.log('🚀 Using fast workflow generation for:', message.substring(0, 100));

      try {
        // Try fast generation first
        const fastResponse = await fetch(`${request.url.replace('/api/chat/message', '/api/workflow/fast-generate')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: message,
            user_id: userId,
            conversation_id: currentConversationId,
          }),
        });

        if (fastResponse.ok) {
          const fastData = await fastResponse.json();
          const generationTime = fastData.generation_time_ms ? `Generated in ${(fastData.generation_time_ms / 1000).toFixed(1)}s` : '';
          const optimizationInfo = fastData.optimization_used ?
            ` (⚡ Optimized with ${fastData.node_patterns_used} patterns)` : '';

          data = {
            success: true,
            conversationResponse: `Here's your generated workflow! ${generationTime}${optimizationInfo}`,
            workflow: fastData.workflow,
            creditsRemaining: null // Will be handled by backend if needed
          };
        } else {
          throw new Error('Fast generation failed');
        }
      } catch (error) {
        console.warn('Fast generation failed, falling back to backend:', error);
        // Fall back to backend
        data = await callBackendAPI(message, userId, currentConversationId);
      }
    } else {
      // Use backend for non-workflow requests
      data = await callBackendAPI(message, userId, currentConversationId);
    }

    async function callBackendAPI(msg: string, uid: string, convId: string) {
      const backendUrl = process.env.BACKEND_URL || 'https://manusn8n-production.up.railway.app';
      console.log('Calling backend:', `${backendUrl}/api/chat/message`, { userId: uid, messageLength: msg.length });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(`${backendUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: msg,
          userId: uid,
          conversationId: convId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Backend response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Backend error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('Backend error data:', errorData);
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.error('Backend error text:', errorText);
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    }
    console.log('Backend response data:', {
      success: data.success,
      hasWorkflow: !!data.workflow,
      creditsRemaining: data.creditsRemaining
    });

    // 6. Save assistant response to conversation
    if (data.conversationResponse) {
      const { error: assistantMsgError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: currentConversationId,
          user_id: userId,
          role: 'assistant',
          content: data.conversationResponse,
          intent: data.workflow ? 'workflow_request' : 'general_conversation',
          metadata: {
            workflow: data.workflow ? true : false,
            creditsUsed: data.workflow ? 1 : 0
          }
        });

      if (assistantMsgError) {
        console.error('Error saving assistant message:', assistantMsgError);
      }
    }

    // 7. Return the enhanced chat response with conversation ID
    return NextResponse.json({
      success: data.success,
      message: data.message,
      conversationResponse: data.conversationResponse,
      workflow: data.workflow,
      suggestions: data.suggestions,
      creditsRemaining: data.creditsRemaining,
      conversationId: currentConversationId,
    });

  } catch (error) {
    console.error('Enhanced chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to process uploaded files
async function processFiles(files: File[]): Promise<string> {
  const fileContents: string[] = [];

  for (const file of files) {
    try {
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        // Process text files
        const text = await file.text();
        fileContents.push(`--- Content of ${file.name} ---\n${text}\n--- End of ${file.name} ---`);
      } else if (file.type === 'application/json') {
        // Process JSON files
        const text = await file.text();
        fileContents.push(`--- JSON content of ${file.name} ---\n${text}\n--- End of ${file.name} ---`);
      } else if (file.type.startsWith('image/')) {
        // For images, just note the file info
        fileContents.push(`--- Image file: ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB) ---\nNote: Image content analysis not yet implemented.`);
      } else {
        // For other files, just note the file info
        fileContents.push(`--- File: ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB) ---\nNote: File content analysis not yet implemented for this file type.`);
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      fileContents.push(`--- Error processing ${file.name} ---\nCould not read file content.`);
    }
  }

  return fileContents.join('\n\n');
}

// Helper function to detect if a message is requesting workflow generation
function isWorkflowGenerationRequest(message: string): boolean {
  const workflowKeywords = [
    'workflow', 'automation', 'automate', 'integrate', 'build', 'create',
    'generate', 'make', 'setup', 'connect', 'trigger', 'schedule',
    'api', 'webhook', 'database', 'email', 'notification', 'sync',
    'google sheets', 'airtable', 'slack', 'discord', 'telegram',
    'http request', 'calendar', 'gmail', 'zapier', 'n8n'
  ];

  const messageLower = message.toLowerCase();

  // Check for workflow keywords
  const hasWorkflowKeywords = workflowKeywords.some(keyword =>
    messageLower.includes(keyword)
  );

  // Check for action words that suggest automation
  const actionWords = ['send', 'fetch', 'get', 'post', 'update', 'delete', 'sync', 'monitor'];
  const hasActionWords = actionWords.some(word => messageLower.includes(word));

  // Check for service integration patterns
  const servicePatterns = [
    /integrate .+ with .+/i,
    /connect .+ to .+/i,
    /sync .+ with .+/i,
    /send .+ to .+/i,
    /when .+ then .+/i,
    /if .+ then .+/i
  ];
  const hasServicePatterns = servicePatterns.some(pattern => pattern.test(message));

  // Consider it a workflow request if it has workflow keywords OR (action words AND service patterns)
  return hasWorkflowKeywords || (hasActionWords && hasServicePatterns);
}
