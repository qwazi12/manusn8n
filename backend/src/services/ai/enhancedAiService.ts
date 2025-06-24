// src/services/ai/enhancedAiService.ts
import { aiService } from './aiService';
import { claudeService } from './claudeService';
import { WorkflowGenerationRequest, WorkflowGenerationResponse } from './aiService';
import { logger } from '../../utils/logger';

export type AIProvider = 'openai' | 'claude';

export interface EnhancedWorkflowGenerationRequest extends WorkflowGenerationRequest {
  provider?: AIProvider;
  useAdvancedMode?: boolean; // Use both providers for comparison
}

class EnhancedAiService {
  private static instance: EnhancedAiService;

  private constructor() {
    logger.info('Enhanced AI service initialized');
  }

  public static getInstance(): EnhancedAiService {
    if (!EnhancedAiService.instance) {
      EnhancedAiService.instance = new EnhancedAiService();
    }
    return EnhancedAiService.instance;
  }

  /**
   * Generate workflow using specified provider or default to OpenAI
   */
  async generateWorkflow(request: EnhancedWorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    const provider = request.provider || 'openai';
    
    try {
      logger.info('Generating workflow with enhanced AI service', { 
        userId: request.userId, 
        provider,
        useAdvancedMode: request.useAdvancedMode 
      });

      if (request.useAdvancedMode) {
        return await this.generateWithBothProviders(request);
      }

      switch (provider) {
        case 'claude':
          return await claudeService.generateWorkflow(request);
        case 'openai':
        default:
          return await aiService.generateWorkflow(request);
      }
    } catch (error) {
      logger.error('Error in enhanced AI service', { error, userId: request.userId, provider });
      return {
        workflow: null,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate workflow using both providers and return the best result
   */
  private async generateWithBothProviders(request: EnhancedWorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
    try {
      logger.info('Generating workflow with both providers', { userId: request.userId });

      // Generate with both providers in parallel
      const [openaiResult, claudeResult] = await Promise.allSettled([
        aiService.generateWorkflow(request),
        claudeService.generateWorkflow(request)
      ]);

      // Analyze results and pick the best one
      const openaiWorkflow = openaiResult.status === 'fulfilled' ? openaiResult.value : null;
      const claudeWorkflow = claudeResult.status === 'fulfilled' ? claudeResult.value : null;

      // If both succeeded, prefer Claude for complex workflows, OpenAI for simple ones
      if (openaiWorkflow?.status === 'completed' && claudeWorkflow?.status === 'completed') {
        const isComplexWorkflow = this.isComplexWorkflow(request.prompt);
        const selectedResult = isComplexWorkflow ? claudeWorkflow : openaiWorkflow;
        const selectedProvider = isComplexWorkflow ? 'Claude' : 'OpenAI';
        
        return {
          ...selectedResult,
          message: `Workflow generated successfully using ${selectedProvider} (advanced mode)`
        };
      }

      // If only one succeeded, use that one
      if (openaiWorkflow?.status === 'completed') {
        return {
          ...openaiWorkflow,
          message: 'Workflow generated successfully using OpenAI (Claude failed)'
        };
      }

      if (claudeWorkflow?.status === 'completed') {
        return {
          ...claudeWorkflow,
          message: 'Workflow generated successfully using Claude (OpenAI failed)'
        };
      }

      // If both failed, return error
      return {
        workflow: null,
        status: 'failed',
        message: 'Both AI providers failed to generate workflow'
      };

    } catch (error) {
      logger.error('Error in dual-provider workflow generation', { error, userId: request.userId });
      return {
        workflow: null,
        status: 'failed',
        message: 'Error in advanced mode workflow generation'
      };
    }
  }

  /**
   * Determine if a workflow request is complex based on keywords and length
   */
  private isComplexWorkflow(prompt: string): boolean {
    const complexKeywords = [
      'conditional', 'if', 'else', 'loop', 'iterate', 'multiple', 'complex',
      'database', 'api', 'webhook', 'schedule', 'cron', 'batch', 'transform',
      'filter', 'aggregate', 'join', 'merge', 'split', 'parallel'
    ];

    const lowerPrompt = prompt.toLowerCase();
    const hasComplexKeywords = complexKeywords.some(keyword => lowerPrompt.includes(keyword));
    const isLongPrompt = prompt.length > 200;

    return hasComplexKeywords || isLongPrompt;
  }

  /**
   * Get available AI providers
   */
  getAvailableProviders(): AIProvider[] {
    return ['openai', 'claude'];
  }

  /**
   * Test connectivity to AI providers
   */
  async testProviders(): Promise<{ [key in AIProvider]: boolean }> {
    const results: { [key in AIProvider]: boolean } = {
      openai: false,
      claude: false
    };

    try {
      const testRequest: WorkflowGenerationRequest = {
        prompt: 'Create a simple test workflow',
        userId: 'test-user'
      };

      // Test OpenAI
      try {
        const openaiResult = await aiService.generateDraft(testRequest);
        results.openai = !!openaiResult;
      } catch (error) {
        logger.warn('OpenAI provider test failed', { error });
      }

      // Test Claude
      try {
        const claudeResult = await claudeService.generateDraft(testRequest);
        results.claude = !!claudeResult;
      } catch (error) {
        logger.warn('Claude provider test failed', { error });
      }

    } catch (error) {
      logger.error('Error testing AI providers', { error });
    }

    return results;
  }
}

export const enhancedAiService = EnhancedAiService.getInstance();
