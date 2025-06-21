// Enhanced NodePilot AI Service with OpenAI GPT-4o + Claude Sonnet 4 Hybrid Architecture
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: 'workflow_request' | 'general_conversation' | 'clarification_needed';
  confidence?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface WorkflowGenerationRequest {
  userPrompt: string;
  conversationHistory: ConversationMessage[];
  userId: string;
  refinedPrompt?: string;
}

export interface WorkflowGenerationResponse {
  success: boolean;
  workflow?: any;
  message: string;
  conversationResponse: string;
  suggestions?: string[];
  error?: string;
}

export class EnhancedNodePilotAiService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private supabase: any;
  private prompts: Map<string, string> = new Map();
  private conversationHistory: Map<string, ConversationMessage[]> = new Map();

  constructor() {
    // Initialize OpenAI for conversations
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    // Initialize Claude for workflow generation
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });

    // Initialize Supabase
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      await this.loadPromptsFromDatabase();
      console.log('Enhanced NodePilot AI service initialized with GPT-4o + Claude Sonnet 4 hybrid architecture');
    } catch (error) {
      console.error('Failed to initialize Enhanced NodePilot AI service:', error);
    }
  }

  private async loadPromptsFromDatabase(): Promise<void> {
    try {
      const { data: prompts, error } = await this.supabase
        .from('ai_prompts')
        .select('*');

      if (error) throw error;

      prompts?.forEach((prompt: any) => {
        this.prompts.set(prompt.name, prompt.content);
        console.log(`Loaded prompt from DB: ${prompt.name}`);
      });

      // Add conversation-specific prompts
      await this.ensureConversationPrompts();
    } catch (error) {
      console.error('Error loading prompts from database:', error);
    }
  }

  private async ensureConversationPrompts(): Promise<void> {
    const conversationPrompts = [
      {
        name: 'intent_classification',
        content: `You are an advanced intent classifier for NodePilot, an n8n workflow automation platform.
Using GPT-4o's advanced reasoning capabilities, analyze user input and classify it into one of these categories:

1. WORKFLOW_REQUEST: User wants to create, modify, or get help with n8n workflows
   - Keywords: create, build, automate, workflow, connect, integrate, sync
   - Examples: "Create a workflow that...", "I need to automate...", "Build me a workflow for..."

2. GENERAL_CONVERSATION: User wants to chat, ask questions, or get help about the platform
   - Keywords: what, how, help, explain, price, cost, features
   - Examples: "What is NodePilot?", "How does this work?", "What can you do?"

3. CLARIFICATION_NEEDED: Input is unclear or needs more information
   - Vague requests, incomplete information, ambiguous intent

Respond in JSON format:
{
  "intent": "workflow_request|general_conversation|clarification_needed",
  "confidence": 85,
  "reasoning": "Brief explanation",
  "entities": {
    "tools": ["Gmail", "Slack"],
    "actions": ["send", "notify"],
    "triggers": ["new email"]
  }
}`
      },
      {
        name: 'conversation_handler',
        content: `You are NodePilot's conversational assistant. You help users with:

- Questions about NodePilot and n8n workflow automation
- Platform features, pricing, and capabilities  
- General guidance and support
- Explaining how automation works

Be conversational, helpful, and knowledgeable. If users show interest in creating workflows, guide them toward workflow creation.

Keep responses concise but informative. Always be ready to help with workflow creation if the user shows interest.`
      },
      {
        name: 'workflow_prompt_optimizer',
        content: `You are a prompt optimizer for n8n workflow generation. Your job is to take a user's workflow request and optimize it for Claude Sonnet 4 to generate the best possible n8n workflow.

Transform the user's request into a detailed, structured prompt that includes:

1. Clear workflow objective
2. Specific tools/services to connect
3. Trigger conditions
4. Actions to perform
5. Data flow requirements
6. Error handling needs

Make the prompt comprehensive and technical while preserving the user's intent.

Input: User's original request
Output: Optimized prompt for workflow generation`
      }
    ];

    for (const prompt of conversationPrompts) {
      const existing = this.prompts.get(prompt.name);
      if (!existing) {
        // Add to database
        await this.supabase
          .from('ai_prompts')
          .insert({
            name: prompt.name,
            content: prompt.content,
            version: 1,
            is_active: true
          });
        
        this.prompts.set(prompt.name, prompt.content);
        console.log(`Added new conversation prompt: ${prompt.name}`);
      }
    }
  }

  // Main entry point for processing user messages
  async processUserMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<WorkflowGenerationResponse> {
    try {
      // Get or create conversation history
      const history = this.getConversationHistory(userId, conversationId);
      
      // Step 1: Classify intent using OpenAI
      const classification = await this.classifyIntent(message, history);
      
      // Add user message to history
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        intent: classification.intent,
        confidence: classification.confidence,
        timestamp: new Date()
      };
      history.push(userMessage);

      let response: WorkflowGenerationResponse;

      if (classification.intent === 'workflow_request' && classification.confidence > 70) {
        // Step 2: Generate workflow using Claude
        response = await this.generateWorkflowWithClaude({
          userPrompt: message,
          conversationHistory: history,
          userId
        });
      } else {
        // Step 3: Handle conversation using OpenAI
        response = await this.handleConversationWithOpenAI(message, history, classification);
      }

      // Add assistant response to history
      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.conversationResponse,
        timestamp: new Date()
      };
      history.push(assistantMessage);

      // Store conversation in database
      await this.storeConversation(userId, conversationId, history);

      return response;

    } catch (error) {
      console.error('Error processing user message:', error);
      return {
        success: false,
        message: 'I encountered an error processing your request. Please try again.',
        conversationResponse: 'I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // OpenAI Intent Classification
  private async classifyIntent(
    message: string,
    history: ConversationMessage[]
  ): Promise<{ intent: string; confidence: number; reasoning: string; entities: any }> {
    try {
      const prompt = this.prompts.get('intent_classification') || '';
      const recentHistory = history.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Recent conversation:\n${recentHistory}\n\nCurrent message: ${message}` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      return {
        intent: result.intent || 'general_conversation',
        confidence: result.confidence || 50,
        reasoning: result.reasoning || 'Default classification',
        entities: result.entities || {}
      };
    } catch (error) {
      console.error('Intent classification error:', error);
      // Fallback classification
      const isWorkflowRequest = /create|build|automate|workflow|connect|integrate/i.test(message);
      return {
        intent: isWorkflowRequest ? 'workflow_request' : 'general_conversation',
        confidence: 60,
        reasoning: 'Fallback keyword-based classification',
        entities: {}
      };
    }
  }

  // OpenAI Conversation Handling
  private async handleConversationWithOpenAI(
    message: string,
    history: ConversationMessage[],
    classification: any
  ): Promise<WorkflowGenerationResponse> {
    try {
      const conversationPrompt = this.prompts.get('conversation_handler') || '';
      const recentHistory = history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: conversationPrompt },
          { role: 'user', content: `Conversation history:\n${recentHistory}\n\nUser message: ${message}\n\nClassification: ${classification.intent} (${classification.confidence}% confidence)` }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const conversationResponse = response.choices[0]?.message?.content || 'How can I help you today?';

      // Generate suggestions based on intent
      const suggestions = this.generateSuggestions(classification.intent);

      return {
        success: true,
        message: conversationResponse,
        conversationResponse,
        suggestions
      };
    } catch (error) {
      console.error('Conversation handling error:', error);
      return {
        success: false,
        message: 'I\'m here to help! What would you like to know about NodePilot?',
        conversationResponse: 'I\'m here to help! What would you like to know about NodePilot?',
        suggestions: ['Create a workflow', 'Learn about n8n', 'See pricing', 'Get help']
      };
    }
  }

  // Claude Workflow Generation
  private async generateWorkflowWithClaude(
    request: WorkflowGenerationRequest
  ): Promise<WorkflowGenerationResponse> {
    try {
      // Step 1: Optimize prompt using OpenAI
      const optimizedPrompt = await this.optimizePromptForWorkflow(request);

      // Step 2: Generate workflow using Claude Sonnet 4
      const workflowPrompt = this.prompts.get('main_prompt') || '';
      const fullPrompt = `${workflowPrompt}\n\nOptimized Request: ${optimizedPrompt}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Using latest Claude Sonnet
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      });

      const workflowContent = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      // Parse workflow JSON
      let workflow;
      try {
        const jsonMatch = workflowContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          workflow = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find JSON in the response
          const jsonStart = workflowContent.indexOf('{');
          const jsonEnd = workflowContent.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd > jsonStart) {
            workflow = JSON.parse(workflowContent.substring(jsonStart, jsonEnd));
          }
        }
      } catch (parseError) {
        console.error('Failed to parse workflow JSON:', parseError);
      }

      // Generate conversational response using OpenAI
      const conversationResponse = await this.generateWorkflowExplanation(request.userPrompt, workflow);

      return {
        success: true,
        workflow,
        message: 'Workflow generated successfully!',
        conversationResponse,
        suggestions: ['Modify this workflow', 'Create another workflow', 'Download workflow', 'Explain how it works']
      };

    } catch (error) {
      console.error('Workflow generation error:', error);
      
      // Fallback conversational response
      const fallbackResponse = await this.handleConversationWithOpenAI(
        `I'd like to help you create a workflow for: ${request.userPrompt}. Could you provide more details about what you want to automate?`,
        request.conversationHistory,
        { intent: 'workflow_request', confidence: 80 }
      );

      return {
        success: false,
        message: 'I encountered an issue generating the workflow. Let me help you refine your request.',
        conversationResponse: fallbackResponse.conversationResponse,
        suggestions: ['Tell me more about your automation needs', 'What tools do you want to connect?', 'What should trigger this workflow?'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Optimize user prompt for workflow generation
  private async optimizePromptForWorkflow(request: WorkflowGenerationRequest): Promise<string> {
    try {
      const optimizerPrompt = this.prompts.get('workflow_prompt_optimizer') || '';
      const recentHistory = request.conversationHistory.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: optimizerPrompt },
          { role: 'user', content: `Conversation context:\n${recentHistory}\n\nUser's workflow request: ${request.userPrompt}` }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      return response.choices[0]?.message?.content || request.userPrompt;
    } catch (error) {
      console.error('Prompt optimization error:', error);
      return request.userPrompt;
    }
  }

  // Generate explanation of workflow using OpenAI
  private async generateWorkflowExplanation(userPrompt: string, workflow: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are NodePilot\'s assistant. Explain the generated workflow in a conversational, helpful way. Focus on what it does and how it helps the user.'
          },
          {
            role: 'user',
            content: `User requested: "${userPrompt}"\n\nGenerated workflow: ${JSON.stringify(workflow, null, 2)}\n\nExplain this workflow in a friendly, conversational way.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || 'I\'ve created a workflow for you! You can copy or download it to use in n8n.';
    } catch (error) {
      console.error('Workflow explanation error:', error);
      return 'I\'ve created a workflow for you! You can copy or download it to use in n8n.';
    }
  }

  // Helper methods
  private getConversationHistory(userId: string, conversationId?: string): ConversationMessage[] {
    const key = conversationId || userId;
    if (!this.conversationHistory.has(key)) {
      this.conversationHistory.set(key, []);
    }
    return this.conversationHistory.get(key)!;
  }

  private generateSuggestions(intent: string): string[] {
    switch (intent) {
      case 'workflow_request':
        return ['Tell me more details', 'What tools to connect?', 'What triggers this?', 'Show me examples'];
      case 'general_conversation':
        return ['Create a workflow', 'See examples', 'Learn about n8n', 'View pricing'];
      default:
        return ['Create a workflow', 'Ask a question', 'Get help', 'See features'];
    }
  }

  private async storeConversation(userId: string, conversationId: string | undefined, history: ConversationMessage[]): Promise<void> {
    try {
      // Store in Supabase - you can extend your existing schema
      // This is a placeholder for conversation storage
      console.log(`Storing conversation for user ${userId}:`, history.length, 'messages');
    } catch (error) {
      console.error('Error storing conversation:', error);
    }
  }

  // Legacy compatibility method for existing workflow generation
  async generateWorkflow(prompt: string, userId?: string): Promise<any> {
    const response = await this.processUserMessage(userId || 'anonymous', prompt);
    return {
      success: response.success,
      workflow: response.workflow,
      message: response.message,
      error: response.error
    };
  }
}

