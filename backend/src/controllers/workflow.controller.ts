// src/controllers/workflow.controller.ts
import { Request, Response } from 'express';
import { workflowService } from '../services/workflow/workflowService';
import { logger } from '../utils/logger';

class WorkflowController {
  /**
   * Generate a workflow based on user prompt
   */
  async generateWorkflow(req: Request, res: Response) {
    try {
      const { prompt, files, useCache, provider, useAdvancedMode } = req.body;
      const userId = req.user?.id;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate provider if specified
      if (provider && !['openai', 'claude'].includes(provider)) {
        return res.status(400).json({ error: 'Invalid AI provider. Use "openai" or "claude"' });
      }

      const result = await workflowService.generateWorkflow({
        prompt,
        userId,
        files,
        useCache,
        provider,
        useAdvancedMode
      });

      if (result.status === 'failed' && result.message === 'Insufficient credits') {
        return res.status(403).json({
          error: 'No credits remaining',
          upgrade_url: '/pricing',
          remaining_credits: result.remainingCredits
        });
      }

      return res.status(200).json({
        workflow: result.workflow,
        message: result.status === 'completed' ? 'success' : result.message,
        remaining_credits: result.remainingCredits,
        workflow_id: result.workflowId
      });
    } catch (error) {
      logger.error('Workflow generation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all workflows for a user
   */
  async getUserWorkflows(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const workflows = await workflowService.getWorkflowsByUserId(userId);
      return res.status(200).json({ workflows });
    } catch (error) {
      logger.error('Error fetching user workflows:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflowById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // This would need to be implemented in the workflow service
      // For now, we'll return a placeholder response
      return res.status(501).json({ error: 'Not implemented yet' });
    } catch (error) {
      logger.error('Error fetching workflow by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const workflowController = new WorkflowController();
