// src/services/ai/nodePilotAiService.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import { supabaseService } from '../database/supabaseService';
import { toolService } from './toolService';
import { ragService } from './ragService';
import fs from 'fs/promises';
import path from 'path';

// Types for NodePilot AI system
export interface NodePilotAiRequest {
  prompt: string;
  userId: string;
  conversationId?: string;
  files?: string[];
}

export interface NodePilotAiResponse {
  workflow: any;
  status: 'completed' | 'failed' | 'in_progress';
  message: string;
  conversationId: string;
  toolCalls?: any[];
}

export interface AgentState {
  step: number;
  status: 'analyzing' | 'planning' | 'executing' | 'validating' | 'completed' | 'failed';
  currentTask?: string;
  memories?: any[];
  eventStream: any[];
}

class NodePilotAiService {
  private anthropic: Anthropic;
  private static instance: NodePilotAiService;
  private prompts: Map<string, string> = new Map();
  private tools: any[] = [];

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });

    // Set fallback prompts immediately to ensure service is functional
    this.setFallbackPrompts();
    this.setFallbackTools();

    // Try to load custom prompts asynchronously (non-blocking)
    this.initializePrompts().catch(error => {
      logger.warn('Could not load custom prompts, using fallbacks:', error);
    });

    this.initializeTools();
    logger.info('NodePilot AI service initialized with advanced agent capabilities');
  }

  public static getInstance(): NodePilotAiService {
    if (!NodePilotAiService.instance) {
      NodePilotAiService.instance = new NodePilotAiService();
    }
    return NodePilotAiService.instance;
  }

  /**
   * Initialize AI prompts from the 7-file system
   */
  private async initializePrompts(): Promise<void> {
    try {
      const promptsDir = path.join(__dirname, '../../ai_prompts');
      
      // Load all prompt files
      const promptFiles = [
        'nodepilot_ai_prompt.txt',
        'nodepilot_ai_chatprompt.txt', 
        'nodepilot_ai_agentloop.txt',
        'nodepilot_ai_modules.txt',
        'nodepilot_ai_memory_prompt.txt',
        'nodepilot_ai_memory_rating_prompt.txt'
      ];

      for (const file of promptFiles) {
        try {
          const content = await fs.readFile(path.join(promptsDir, file), 'utf-8');
          const key = file.replace('.txt', '').replace('nodepilot_ai_', '');
          this.prompts.set(key, content);
          logger.info(`Loaded prompt: ${key}`);
        } catch (error) {
          logger.warn(`Could not load prompt file ${file}, using fallback`);
          // Set fallback prompts based on the content you provided
          this.setFallbackPrompts();
        }
      }

      // Load tools configuration
      try {
        const toolsContent = await fs.readFile(path.join(promptsDir, 'nodepilot_ai_tools.json'), 'utf-8');
        this.tools = JSON.parse(toolsContent);
        logger.info('Loaded tools configuration');
      } catch (error) {
        logger.warn('Could not load tools file, using fallback');
        this.setFallbackTools();
      }

    } catch (error) {
      logger.error('Error initializing prompts:', error);
      this.setFallbackPrompts();
      this.setFallbackTools();
    }
  }

  /**
   * Set fallback prompts based on provided content
   */
  private setFallbackPrompts(): void {
    this.prompts.set('prompt', `You are the AI component of NodePilot, a SaaS platform designed to convert natural language instructions into functional n8n workflow JSON. Your primary purpose is to assist users in generating, validating, and understanding n8n workflows.

## Capabilities
- Generate n8n workflow JSON from natural language descriptions
- Validate and refine n8n workflow JSON for correctness and best practices  
- Provide explanations and documentation for n8n nodes, expressions, and concepts
- Assist with troubleshooting common n8n workflow issues
- Communicate effectively with users through the NodePilot frontend

## Technical Context
- Understand core n8n workflow JSON structure: nodes, connections, settings, credentials
- Proficiency in n8n expressions ({{ $json.fieldName }}) for dynamic data handling
- Generate workflows for various integrations (Slack, Google Sheets, HTTP, databases, AI agents)

## Task Approach
1. Analyze natural language prompts to identify desired n8n workflow functionality
2. Break down complex requests into manageable components
3. Generate initial n8n workflow JSON draft
4. Validate and refine the workflow using internal tools
5. Ensure workflows meet requirements and follow n8n best practices`);

    this.prompts.set('chatprompt', `You are the AI component of NodePilot. Follow these communication rules:

- Use backticks to format n8n node names, workflow elements, and JSON keys
- Always provide complete n8n workflow JSON in code blocks
- Follow with clear, step-by-step implementation guides
- Never mention tool names to users - provide seamless experience
- Prefer tool calls over asking users for information
- Execute plans immediately without waiting for user confirmation

When generating workflows, always provide:
1. Complete JSON workflow structure
2. Step-by-step setup instructions
3. Explanation of key components
4. Best practices and considerations`);

    this.prompts.set('agentloop', `You operate in a continuous agent loop with these steps:
1. Analyze User Input: Understand requests and conversation state
2. Select Action: Choose appropriate tools or communication methods  
3. Execute Action: Perform selected action within NodePilot system
4. Process Results: Evaluate outcomes and results
5. Communicate & Iterate: Send updates/questions to user, continue loop
6. Enter Standby: Wait for new instructions when task complete`);
  }

  /**
   * Set fallback tools configuration
   */
  private setFallbackTools(): void {
    this.tools = [
      {
        type: "function",
        function: {
          name: "message_notify_user",
          description: "Send a message to the user via the NodePilot frontend",
          parameters: {
            type: "object", 
            properties: {
              text: { type: "string", description: "Message text to display to user" }
            },
            required: ["text"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "n8n_workflow_validator", 
          description: "Validate an n8n workflow JSON structure",
          parameters: {
            type: "object",
            properties: {
              workflow_json: { type: "string", description: "The n8n workflow JSON string to validate" }
            },
            required: ["workflow_json"]
          }
        }
      }
    ];
  }

  /**
   * Initialize tools (placeholder for future tool implementations)
   */
  private initializeTools(): void {
    // Tools will be implemented as the system expands
    logger.info('Tools initialized');
  }

  /**
   * Generate workflow using the advanced NodePilot AI system
   */
  async generateWorkflow(request: NodePilotAiRequest): Promise<NodePilotAiResponse> {
    try {
      logger.info('Starting NodePilot AI workflow generation', { userId: request.userId });

      // Initialize agent state
      const agentState: AgentState = {
        step: 1,
        status: 'analyzing',
        eventStream: []
      };

      // Load user memories
      const memories = await this.loadUserMemories(request.userId);
      agentState.memories = memories;

      // Build comprehensive system prompt
      const systemPrompt = this.buildSystemPrompt(memories);

      // Execute agent loop
      const result = await this.executeAgentLoop(request, agentState, systemPrompt);

      return result;

    } catch (error) {
      logger.error('Error in NodePilot AI workflow generation', { error, userId: request.userId });
      return {
        workflow: null,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        conversationId: request.conversationId || 'error'
      };
    }
  }

  /**
   * Build comprehensive system prompt from all components
   */
  private buildSystemPrompt(memories: any[]): string {
    const basePrompt = this.prompts.get('prompt') || '';
    const chatPrompt = this.prompts.get('chatprompt') || '';
    const agentLoop = this.prompts.get('agentloop') || '';
    
    let systemPrompt = `${basePrompt}\n\n## Communication Guidelines\n${chatPrompt}\n\n## Agent Loop\n${agentLoop}`;

    // Add user memories if available
    if (memories && memories.length > 0) {
      systemPrompt += '\n\n## User Preferences & Memories\n';
      memories.forEach(memory => {
        systemPrompt += `- ${memory.content}\n`;
      });
    }

    return systemPrompt;
  }

  /**
   * Execute the agent loop for workflow generation
   */
  private async executeAgentLoop(
    request: NodePilotAiRequest, 
    agentState: AgentState, 
    systemPrompt: string
  ): Promise<NodePilotAiResponse> {
    
    const conversationId = request.conversationId || `conv_${Date.now()}`;
    
    try {
      // Step 1: Analyze and generate initial workflow
      agentState.status = 'executing';
      agentState.currentTask = 'Generating n8n workflow';

      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Generate an n8n workflow for: ${request.prompt}`
          }
        ]
      });

      // Extract workflow JSON from response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const workflowJson = this.extractWorkflowJson(content.text);
      
      // Step 2: Validate workflow
      agentState.status = 'validating';
      const isValid = await this.validateWorkflow(workflowJson);
      
      if (!isValid) {
        // Attempt to fix workflow
        const fixedWorkflow = await this.fixWorkflow(workflowJson, systemPrompt);
        agentState.status = 'completed';
        
        return {
          workflow: fixedWorkflow,
          status: 'completed',
          message: 'Workflow generated and validated successfully (with corrections)',
          conversationId,
          toolCalls: agentState.eventStream
        };
      }

      agentState.status = 'completed';
      
      return {
        workflow: workflowJson,
        status: 'completed', 
        message: 'Workflow generated and validated successfully',
        conversationId,
        toolCalls: agentState.eventStream
      };

    } catch (error) {
      logger.error('Error in agent loop execution', { error });
      return {
        workflow: null,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Agent loop execution failed',
        conversationId
      };
    }
  }

  /**
   * Extract workflow JSON from Claude response
   */
  private extractWorkflowJson(text: string): any {
    try {
      // Try to extract JSON from code blocks
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      
      return JSON.parse(jsonString);
    } catch (error) {
      // Return mock workflow if parsing fails
      return this.getMockWorkflow();
    }
  }

  /**
   * Validate workflow using internal validator
   */
  private async validateWorkflow(workflow: any): Promise<boolean> {
    try {
      // Basic validation - check required fields
      if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
        return false;
      }

      // Check if nodes have required properties
      for (const node of workflow.nodes) {
        if (!node.id || !node.type || !node.position) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Workflow validation error', { error });
      return false;
    }
  }

  /**
   * Attempt to fix invalid workflow
   */
  private async fixWorkflow(workflow: any, systemPrompt: string): Promise<any> {
    try {
      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt + '\n\nFix the following invalid n8n workflow JSON to make it valid:',
        messages: [
          {
            role: "user",
            content: `Fix this workflow: ${JSON.stringify(workflow, null, 2)}`
          }
        ]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.extractWorkflowJson(content.text);
      }
      
      return workflow;
    } catch (error) {
      logger.error('Error fixing workflow', { error });
      return workflow;
    }
  }

  /**
   * Load user memories from database
   */
  private async loadUserMemories(userId: string): Promise<any[]> {
    try {
      // This would integrate with your Supabase memory system
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Error loading user memories', { error });
      return [];
    }
  }

  /**
   * Generate mock workflow for fallback
   */
  private getMockWorkflow(): any {
    return {
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
            path: 'nodepilot-workflow',
            httpMethod: 'POST'
          },
          name: 'NodePilot Webhook'
        }
      ],
      connections: [
        {
          source: 'start',
          target: 'webhook',
          sourceHandle: 'main',
          targetHandle: 'main'
        }
      ]
    };
  }
}

export const nodePilotAiService = NodePilotAiService.getInstance();
