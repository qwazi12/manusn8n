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
    let hasWorkflowImages = false;

    if (files.length > 0) {
      // Check if any files are workflow images
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        // Process images through vision service
        try {
          const visionResults = await processWorkflowImages(imageFiles, userId, message);
          if (visionResults.length > 0) {
            hasWorkflowImages = true;
            fileContext = visionResults.join('\n\n');
            message = `${message}\n\n[Workflow images processed: ${imageFiles.map(f => f.name).join(', ')}]\n${fileContext}`;
          } else {
            // Fallback to regular file processing
            fileContext = await processFiles(files);
            message = `${message}\n\n[Files attached: ${files.map(f => f.name).join(', ')}]\n${fileContext}`;
          }
        } catch (error) {
          console.error('Error processing workflow images:', error);
          // Fallback to regular file processing
          fileContext = await processFiles(files);
          message = `${message}\n\n[Files attached: ${files.map(f => f.name).join(', ')}]\n${fileContext}`;
        }
      } else {
        // Process non-image files normally
        fileContext = await processFiles(files);
        message = `${message}\n\n[Files attached: ${files.map(f => f.name).join(', ')}]\n${fileContext}`;
      }
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

    // 5. Use the sophisticated backend AI system for all requests
    // The backend has OpenAI + Claude hybrid system that's optimized for n8n workflows
    console.log('🤖 Using backend AI system for:', message.substring(0, 100));

    const data = await callBackendAPI(message, userId, currentConversationId);

    async function callBackendAPI(msg: string, uid: string, convId: string) {
      const backendUrl = process.env.BACKEND_URL || 'https://manusn8n-production.up.railway.app';
      console.log('🔗 Calling sophisticated backend AI:', `${backendUrl}/api/chat/message`, {
        userId: uid,
        messageLength: msg.length,
        conversationId: convId
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for AI processing

      const requestBody = {
        message: msg,
        userId: uid,
        conversationId: convId,
      };

      const response = await fetch(`${backendUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('🔙 Backend AI response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Backend AI error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('❌ Backend AI error data:', errorData);
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.error('❌ Backend AI error text:', errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Backend AI response:', {
        success: result.success,
        hasWorkflow: !!result.workflow,
        hasMessage: !!result.conversationResponse,
        creditsRemaining: result.creditsRemaining
      });

      return result;
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

// Helper function to process workflow images through vision service
async function processWorkflowImages(imageFiles: File[], userId: string, userMessage: string): Promise<string[]> {
  const results: string[] = [];
  const backendUrl = process.env.BACKEND_URL || 'https://manusn8n-production.up.railway.app';

  for (const file of imageFiles) {
    try {
      console.log(`🖼️ Processing workflow image: ${file.name}`);

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);
      formData.append('additionalContext', userMessage || 'Generate n8n workflow from this image');

      // Call the vision service to generate workflow
      const response = await fetch(`${backendUrl}/api/vision/generate-workflow-from-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userId}`, // Pass user ID for authentication
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`);
      }

      const visionResult = await response.json();

      if (visionResult.success && visionResult.data?.workflow) {
        results.push(`--- Generated n8n Workflow from ${file.name} ---
**Workflow Analysis:** ${visionResult.data.analysis || 'Workflow successfully generated from image'}

**n8n Workflow JSON:**
\`\`\`json
${JSON.stringify(visionResult.data.workflow, null, 2)}
\`\`\`

**Instructions:** Copy the JSON above and import it into your n8n instance to recreate this workflow.`);
      } else {
        results.push(`--- Analysis of ${file.name} ---
${visionResult.message || 'Unable to generate workflow from this image. Please ensure it shows a clear n8n workflow interface.'}`);
      }
    } catch (error) {
      console.error(`Error processing image ${file.name}:`, error);
      results.push(`--- Error processing ${file.name} ---
Unable to analyze this image. Please ensure it's a clear screenshot of an n8n workflow.`);
    }
  }

  return results;
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
        // For images, note that they should be processed by vision service
        fileContents.push(`--- Image file: ${file.name} (${file.type}, ${Math.round(file.size/1024)}KB) ---\nNote: This image will be processed by the vision service for workflow analysis.`);
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
