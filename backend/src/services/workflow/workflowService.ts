// src/services/workflow/workflowService.ts
import { aiService, WorkflowGenerationRequest, WorkflowGenerationResponse } from '../ai/aiService';
import { cacheService } from '../cache/cacheService';
import { creditService } from '../credit/creditService';
import { supabaseService } from '../database/supabaseService';
import { logger } from '../../utils/logger';

// Types for workflow operations
export interface WorkflowRequest {
  prompt: string;
  userId: string;
  files?: string[];
  useCache?: boolean;
}

export interface WorkflowResponse {
  workflow: any;
  workflowId?: string;
  status: 'completed' | 'failed';
  message?: string;
  remainingCredits: number;
}

class WorkflowService {
  private static instance: WorkflowService;

  private constructor() {
    logger.info('Workflow service initialized');
  }

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  /**
   * Generate a workflow based on user prompt
   */
  async generateWorkflow(request: WorkflowRequest): Promise<WorkflowResponse> {
    try {
      const { prompt, userId, files = [], useCache = true } = request;
      
      // Check if user has sufficient credits
      const hasSufficientCredits = await creditService.hasSufficientCredits(userId);
      if (!hasSufficientCredits) {
        return {
          workflow: null,
          status: 'failed',
          message: 'Insufficient credits',
          remainingCredits: (await creditService.getUserCredits(userId)).credits
        };
      }
      
      // Check cache if enabled
      if (useCache) {
        const cacheKey = cacheService.generateWorkflowCacheKey(prompt, userId);
        const cachedWorkflow = await cacheService.get<WorkflowGenerationResponse>(cacheKey);
        
        if (cachedWorkflow) {
          logger.info('Workflow found in cache', { userId });
          
          // Still deduct credits for cached workflows
          const { credits } = await creditService.getUserCredits(userId);
          
          return {
            workflow: cachedWorkflow.workflow,
            status: cachedWorkflow.status,
            message: 'Retrieved from cache',
            remainingCredits: credits
          };
        }
      }
      
      // Generate workflow using AI service
      const aiRequest: WorkflowGenerationRequest = {
        prompt,
        userId,
        files
      };
      
      const generatedWorkflow = await aiService.generateWorkflow(aiRequest);
      
      // Save workflow to database
      const workflowData = {
        user_id: userId,
        prompt,
        json: generatedWorkflow.workflow,
        status: generatedWorkflow.status,
        credits_used: 1,
        file_urls: files
      };
      
      const savedWorkflow = await supabaseService.saveWorkflow(workflowData);
      
      // Deduct credits
      const updatedCredits = await creditService.deductCreditsForWorkflow(
        userId,
        savedWorkflow.id,
        1
      );
      
      // Cache the result if successful
      if (generatedWorkflow.status === 'completed' && useCache) {
        const cacheKey = cacheService.generateWorkflowCacheKey(prompt, userId);
        await cacheService.set(cacheKey, generatedWorkflow, { ttl: 86400 }); // Cache for 24 hours
      }
      
      return {
        workflow: generatedWorkflow.workflow,
        workflowId: savedWorkflow.id,
        status: generatedWorkflow.status,
        message: generatedWorkflow.message,
        remainingCredits: updatedCredits.credits
      };
    } catch (error) {
      logger.error('Error generating workflow', { error, userId: request.userId });
      throw error;
    }
  }

  /**
   * Get workflows by user ID
   */
  async getWorkflowsByUserId(userId: string): Promise<any[]> {
    try {
      return await supabaseService.getWorkflowsByUserId(userId);
    } catch (error) {
      logger.error('Error getting workflows by user ID', { error, userId });
      throw error;
    }
  }
}

export const workflowService = WorkflowService.getInstance();
