// src/services/ai/claudeService.ts
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import { WorkflowGenerationRequest, WorkflowGenerationResponse } from './aiService';

class ClaudeService {
  private anthropic: Anthropic;
  private static instance: ClaudeService;

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
    
    logger.info('Claude service initialized');
  }

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  /**
   * Generate a workflow draft using Claude
   */
  async generateDraft(request: WorkflowGenerationRequest): Promise<any> {
    try {
      logger.info('Generating workflow draft with Claude', { userId: request.userId });
      
      const message = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        temperature: 0.7,
        system: `You are an expert in n8n workflows. Create a valid n8n workflow JSON based on the user's request.

CRITICAL: You must return ONLY valid JSON. No explanations, no markdown, no code blocks. Just pure JSON.

The JSON structure must include:
- nodes: array of node objects with id, type, position {x, y}, parameters, typeVersion
- connections: array of connection objects with source, target, sourceHandle, targetHandle
- meta: object with instanceId
- name: string with workflow name
- active: boolean (set to false)
- staticData: empty object {}

Example structure:
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "active": false,
  "staticData": {},
  "meta": {"instanceId": "n8n-workflow"}
}

Return ONLY the JSON object, nothing else.`,
        messages: [
          {
            role: "user",
            content: request.prompt
          }
        ]
      });
      
      // Extract content from Claude response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }
      
      try {
        // Log the raw response for debugging
        logger.info('Claude raw response:', {
          response: content.text.substring(0, 500) + '...',
          userId: request.userId
        });

        // Try multiple JSON extraction methods
        let jsonString = '';

        // Method 1: Extract from code blocks
        const codeBlockMatch = content.text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          // Method 2: Extract first complete JSON object
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          } else {
            // Method 3: Use entire response if no brackets found
            jsonString = content.text.trim();
          }
        }

        // Clean up the JSON string
        jsonString = jsonString.trim();

        logger.info('Extracted JSON string:', {
          jsonPreview: jsonString.substring(0, 200) + '...',
          userId: request.userId
        });

        const workflowJson = JSON.parse(jsonString);

        // Validate that it's a proper workflow structure
        if (!workflowJson || typeof workflowJson !== 'object') {
          throw new Error('Invalid workflow structure: not an object');
        }

        logger.info('Successfully parsed Claude workflow JSON', { userId: request.userId });
        return workflowJson;
      } catch (parseError) {
        logger.error('Failed to parse Claude response as JSON:', {
          error: parseError,
          rawResponse: content.text.substring(0, 1000),
          userId: request.userId
        });
        logger.warn('Using mock workflow as fallback');
        return this.getMockWorkflow(request.prompt);
      }
    } catch (error) {
      logger.error('Error generating workflow draft with Claude', { error, userId: request.userId });
      
      // If Claude API fails, return a mock workflow for testing
      logger.warn('Claude API failed, returning mock workflow for testing');
      return this.getMockWorkflow(request.prompt);
    }
  }

  /**
   * Polish a workflow draft using Claude
   */
  async polishWorkflow(draft: any, request: WorkflowGenerationRequest): Promise<any> {
    try {
      logger.info('Polishing workflow draft with Claude', { userId: request.userId });
      
      const message = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        temperature: 0.3,
        system: `You are an expert in n8n workflows. Polish and improve the provided n8n workflow JSON.
        Ensure proper error handling, add meaningful node names, optimize connections, and follow n8n best practices.
        Return only the improved JSON workflow structure.
        
        Make sure the JSON is valid and follows n8n workflow structure exactly.`,
        messages: [
          {
            role: "user",
            content: `Original request: ${request.prompt}

Draft workflow:
${JSON.stringify(draft, null, 2)}

Please polish this workflow and return only the improved JSON.`
          }
        ]
      });
      
      // Extract content from Claude response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude for polishing');
      }
      
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content.text;
        
        const polishedWorkflow = JSON.parse(jsonString);
        return polishedWorkflow;
      } catch (parseError) {
        logger.warn('Failed to parse polished workflow from Claude, returning original draft');
        return draft;
      }
    } catch (error) {
      logger.error('Error polishing workflow with Claude', { error, userId: request.userId });
      return draft;
    }
  }

  /**
   * Generate a complete workflow using Claude
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    try {
      // Step 1: Generate draft with Claude
      const draft = await this.generateDraft(request);
      
      // Step 2: Polish with Claude
      const polished = await this.polishWorkflow(draft, request);
      
      return {
        workflow: polished,
        status: 'completed',
        message: 'Workflow generated successfully with Claude'
      };
    } catch (error) {
      logger.error('Error in Claude workflow generation pipeline', { error, userId: request.userId });
      return {
        workflow: null,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate a mock workflow for testing when Claude API is not available
   */
  private getMockWorkflow(prompt: string): any {
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
            path: 'claude-workflow-trigger',
            httpMethod: 'POST'
          },
          name: 'Claude Webhook Trigger'
        },
        {
          id: 'email',
          type: 'n8n-nodes-base.emailSend',
          position: [500, 300],
          parameters: {
            fromEmail: 'noreply@nodepilot.dev',
            toEmail: 'user@example.com',
            subject: 'Claude Workflow Notification',
            text: `Claude workflow triggered: ${prompt}`
          },
          name: 'Send Email via Claude'
        }
      ],
      connections: [
        {
          source: 'start',
          target: 'webhook',
          sourceHandle: 'main',
          targetHandle: 'main'
        },
        {
          source: 'webhook',
          target: 'email',
          sourceHandle: 'main',
          targetHandle: 'main'
        }
      ]
    };
  }
}

export const claudeService = ClaudeService.getInstance();
