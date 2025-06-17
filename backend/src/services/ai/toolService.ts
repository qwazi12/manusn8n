// src/services/ai/toolService.ts
import { ragService } from './ragService';
import { logger } from '../../utils/logger';

export interface ToolCall {
  name: string;
  parameters: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

class ToolService {
  private static instance: ToolService;

  private constructor() {
    logger.info('Tool service initialized');
  }

  public static getInstance(): ToolService {
    if (!ToolService.instance) {
      ToolService.instance = new ToolService();
    }
    return ToolService.instance;
  }

  /**
   * Execute a tool call
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    try {
      logger.info('Executing tool', { toolName: toolCall.name, parameters: toolCall.parameters });

      switch (toolCall.name) {
        case 'message_notify_user':
          return this.messageNotifyUser(toolCall.parameters);
        
        case 'message_ask_user':
          return this.messageAskUser(toolCall.parameters);
        
        case 'n8n_workflow_validator':
          return this.validateWorkflow(toolCall.parameters);
        
        case 'n8n_documentation_lookup':
          return this.lookupDocumentation(toolCall.parameters);
        
        default:
          return {
            success: false,
            error: `Unknown tool: ${toolCall.name}`
          };
      }
    } catch (error) {
      logger.error('Error executing tool', { error, toolCall });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send notification message to user (non-blocking)
   */
  private async messageNotifyUser(parameters: { text: string }): Promise<ToolResult> {
    try {
      // In a real implementation, this would send to the frontend via WebSocket or similar
      logger.info('Notifying user', { message: parameters.text });
      
      return {
        success: true,
        message: 'User notified successfully',
        data: {
          type: 'notification',
          text: parameters.text,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to notify user'
      };
    }
  }

  /**
   * Ask user a question (blocking - waits for response)
   */
  private async messageAskUser(parameters: { text: string }): Promise<ToolResult> {
    try {
      // In a real implementation, this would send to frontend and wait for response
      logger.info('Asking user', { question: parameters.text });
      
      return {
        success: true,
        message: 'Question sent to user',
        data: {
          type: 'question',
          text: parameters.text,
          timestamp: new Date().toISOString(),
          awaitingResponse: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to ask user'
      };
    }
  }

  /**
   * Validate n8n workflow JSON structure
   */
  private async validateWorkflow(parameters: { workflow_json: string }): Promise<ToolResult> {
    try {
      let workflow;
      
      // Parse JSON
      try {
        workflow = JSON.parse(parameters.workflow_json);
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON format',
          data: {
            isValid: false,
            errors: ['JSON parsing failed: ' + (parseError as Error).message]
          }
        };
      }

      // Validate workflow structure
      const validationResult = this.validateWorkflowStructure(workflow);
      
      return {
        success: true,
        data: validationResult
      };
    } catch (error) {
      return {
        success: false,
        error: 'Workflow validation failed'
      };
    }
  }

  /**
   * Validate workflow structure and return detailed results
   */
  private validateWorkflowStructure(workflow: any): any {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required top-level properties
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a "nodes" array');
    }

    if (!workflow.connections) {
      warnings.push('Workflow should have a "connections" object');
    }

    // Validate nodes
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      workflow.nodes.forEach((node: any, index: number) => {
        if (!node.id) {
          errors.push(`Node at index ${index} missing required "id" property`);
        }
        if (!node.type) {
          errors.push(`Node at index ${index} missing required "type" property`);
        }
        if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
          errors.push(`Node at index ${index} missing valid "position" array [x, y]`);
        }
        if (!node.name) {
          warnings.push(`Node at index ${index} should have a "name" property`);
        }
      });
    }

    // Validate connections
    if (workflow.connections) {
      const nodeIds = workflow.nodes ? workflow.nodes.map((n: any) => n.id) : [];
      
      Object.keys(workflow.connections).forEach(sourceId => {
        if (!nodeIds.includes(sourceId)) {
          errors.push(`Connection references non-existent source node: ${sourceId}`);
        }
        
        const connections = workflow.connections[sourceId];
        if (connections.main && Array.isArray(connections.main)) {
          connections.main.forEach((targetList: any[], outputIndex: number) => {
            if (Array.isArray(targetList)) {
              targetList.forEach((target: any) => {
                if (target.node && !nodeIds.includes(target.node)) {
                  errors.push(`Connection references non-existent target node: ${target.node}`);
                }
              });
            }
          });
        }
      });
    }

    // Check for common best practices
    if (workflow.nodes && workflow.nodes.length > 10) {
      warnings.push('Large workflow detected - consider breaking into smaller sub-workflows');
    }

    const hasErrorHandling = workflow.nodes?.some((node: any) => 
      node.type === 'n8n-nodes-base.stopAndError' || 
      node.type === 'n8n-nodes-base.if'
    );
    
    if (!hasErrorHandling && workflow.nodes?.length > 3) {
      warnings.push('Consider adding error handling nodes for better reliability');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      nodeCount: workflow.nodes?.length || 0,
      hasConnections: !!workflow.connections,
      summary: errors.length === 0 ? 'Workflow structure is valid' : 'Workflow has structural issues'
    };
  }

  /**
   * Look up n8n documentation using RAG
   */
  private async lookupDocumentation(parameters: { query: string }): Promise<ToolResult> {
    try {
      const results = await ragService.searchKnowledge({
        query: parameters.query,
        maxResults: 5
      });

      if (results.length === 0) {
        return {
          success: true,
          data: {
            results: [],
            message: 'No relevant documentation found',
            query: parameters.query
          }
        };
      }

      // Format results for better readability
      const formattedResults = results.map(result => ({
        content: result.content,
        source: result.source,
        relevanceScore: Math.round(result.relevanceScore * 100) / 100,
        category: result.metadata.category,
        nodeType: result.metadata.nodeType,
        section: result.metadata.section
      }));

      return {
        success: true,
        data: {
          results: formattedResults,
          totalFound: results.length,
          query: parameters.query,
          message: `Found ${results.length} relevant documentation entries`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Documentation lookup failed'
      };
    }
  }

  /**
   * Get available tools list
   */
  getAvailableTools(): string[] {
    return [
      'message_notify_user',
      'message_ask_user', 
      'n8n_workflow_validator',
      'n8n_documentation_lookup'
    ];
  }

  /**
   * Get tool schema for a specific tool
   */
  getToolSchema(toolName: string): any {
    const schemas: { [key: string]: any } = {
      'message_notify_user': {
        type: 'function',
        function: {
          name: 'message_notify_user',
          description: 'Send a message to the user via the NodePilot frontend',
          parameters: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'Message text to display to user' }
            },
            required: ['text']
          }
        }
      },
      'message_ask_user': {
        type: 'function',
        function: {
          name: 'message_ask_user',
          description: 'Ask the user a question and wait for a response',
          parameters: {
            type: 'object',
            properties: {
              text: { type: 'string', description: 'Question text to present to user' }
            },
            required: ['text']
          }
        }
      },
      'n8n_workflow_validator': {
        type: 'function',
        function: {
          name: 'n8n_workflow_validator',
          description: 'Validate an n8n workflow JSON structure',
          parameters: {
            type: 'object',
            properties: {
              workflow_json: { type: 'string', description: 'The n8n workflow JSON string to validate' }
            },
            required: ['workflow_json']
          }
        }
      },
      'n8n_documentation_lookup': {
        type: 'function',
        function: {
          name: 'n8n_documentation_lookup',
          description: 'Search n8n documentation and knowledge base',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The query to search for in n8n documentation' }
            },
            required: ['query']
          }
        }
      }
    };

    return schemas[toolName] || null;
  }
}

export const toolService = ToolService.getInstance();
