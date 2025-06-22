// Enhanced Workflow Controller for NodePilot
// Integrates with existing Express.js backend structure

import { Request, Response } from 'express';
import { EnhancedNodePilotAiService } from '../services/ai/enhancedNodePilotAiService';
import { creditService } from '../services/credit/creditService';
import { workflowService } from '../services/workflow/workflowService';

export class EnhancedWorkflowController {
  private aiService: EnhancedNodePilotAiService;

  constructor() {
    this.aiService = new EnhancedNodePilotAiService();
  }

  // Enhanced chat endpoint that handles both conversations and workflow generation
  async processChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId, conversationId } = req.body;

      if (!message || !userId) {
        res.status(400).json({
          success: false,
          error: 'Message and userId are required'
        });
        return;
      }

      // Check user credits before processing
      const creditBalance = await creditService.getUserCredits(userId);
      if (creditBalance <= 0) {
        res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          message: 'You need more credits to continue. Please upgrade your plan.',
          requiresUpgrade: true
        });
        return;
      }

      // Process the message with enhanced AI service
      const result = await this.aiService.processUserMessage(userId, message, conversationId);

      // Only deduct credits for workflow generation, not general conversation
      if (result.success && result.workflow) {
        await creditService.deductCredits(userId, 1, 'workflow_generation');
        
        // Save workflow to database
        if (result.workflow) {
          await workflowService.saveWorkflow({
            userId,
            workflowData: result.workflow,
            prompt: message,
            conversationId
          });
        }
      }

      // Return enhanced response
      res.json({
        success: result.success,
        message: result.message,
        conversationResponse: result.conversationResponse,
        workflow: result.workflow,
        suggestions: result.suggestions,
        conversationId: conversationId || `conv_${userId}_${Date.now()}`,
        creditsRemaining: await creditService.getUserCredits(userId),
        workflowGenerated: !!result.workflow
      });

    } catch (error) {
      console.error('Enhanced chat processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'I encountered an error processing your request. Please try again.'
      });
    }
  }

  // Legacy workflow generation endpoint (for backward compatibility)
  async generateWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, userId } = req.body;

      if (!prompt || !userId) {
        res.status(400).json({
          success: false,
          error: 'Prompt and userId are required'
        });
        return;
      }

      // Check credits
      const creditBalance = await creditService.getUserCredits(userId);
      if (creditBalance <= 0) {
        res.status(402).json({
          success: false,
          error: 'Insufficient credits'
        });
        return;
      }

      // Use enhanced service for workflow generation
      const result = await this.aiService.generateWorkflow(prompt, userId);

      if (result.success && result.workflow) {
        await creditService.deductCredits(userId, 1, 'workflow_generation');
        
        await workflowService.saveWorkflow({
          userId,
          workflowData: result.workflow,
          prompt
        });
      }

      res.json({
        success: result.success,
        workflow: result.workflow,
        message: result.message,
        error: result.error,
        creditsRemaining: await creditService.getUserCredits(userId)
      });

    } catch (error) {
      console.error('Workflow generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get conversation history
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, conversationId } = req.params;
      const { limit = 50 } = req.query;

      // This would integrate with your conversation storage system
      // For now, return a placeholder response
      res.json({
        success: true,
        messages: [],
        conversationId,
        totalMessages: 0
      });

    } catch (error) {
      console.error('Get conversation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve conversation history'
      });
    }
  }

  // Get user conversations list
  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // This would integrate with your conversation storage system
      res.json({
        success: true,
        conversations: [],
        totalConversations: 0
      });

    } catch (error) {
      console.error('Get user conversations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve conversations'
      });
    }
  }
}

