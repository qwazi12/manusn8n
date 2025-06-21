// src/routes/index.ts
import { Router } from 'express';
import workflowRoutes from './workflow.routes';
import creditRoutes from './credit.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import batchRoutes from './batch.routes';
import templateRoutes from './template.routes';
import pricingRoutes from './pricing.routes';
import { nodePilotAiService } from '../services/ai/nodePilotAiService';
import { logger } from '../utils/logger';

const router = Router();

// Mount route groups
router.use('/workflows', workflowRoutes);
router.use('/credits', creditRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/batch', batchRoutes);
router.use('/templates', templateRoutes);
router.use('/pricing', pricingRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'NodePilot API is running' });
});

// Test AI endpoint (no auth required) - Direct AI service call
router.post('/test-ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await nodePilotAiService.generateWorkflow({
      prompt,
      userId: 'test-user',
      files: []
    });

    return res.status(200).json({
      workflow: result.workflow,
      message: 'AI workflow generated successfully',
      status: result.status
    });
  } catch (error) {
    logger.error('Test AI error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Enhanced chat endpoint - Main conversational interface
router.post('/chat/message', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Use the enhanced AI service for intelligent conversation
    const result = await nodePilotAiService.processUserMessage(
      userId,
      message,
      conversationId
    );

    // Handle credit deduction and get remaining credits
    let creditsRemaining;
    try {
      // Always get current credits to display
      const { creditService } = await import('../services/credit/creditService');

      // Deduct 1 credit for EVERY chat interaction (as requested)
      if (result.success) {
        logger.info('Chat interaction, deducting 1 credit', { userId, hasWorkflow: !!result.workflow });
        await creditService.deductCreditsForWorkflow(userId, 'chat_interaction_' + Date.now(), 1);
      }

      // Get updated credit balance
      const creditInfo = await creditService.getUserCredits(userId);
      creditsRemaining = creditInfo.credits;

    } catch (creditError) {
      logger.error('Error handling credits:', creditError);
      // Try to get credits without deduction
      try {
        const { creditService } = await import('../services/credit/creditService');
        const creditInfo = await creditService.getUserCredits(userId);
        creditsRemaining = creditInfo.credits;
      } catch (fallbackError) {
        logger.error('Error fetching credits fallback:', fallbackError);
      }
    }

    return res.status(200).json({
      success: result.success,
      message: result.message,
      conversationResponse: result.conversationResponse,
      workflow: result.workflow,
      suggestions: result.suggestions,
      creditsRemaining,
      error: result.error
    });
  } catch (error) {
    logger.error('Enhanced chat error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced chat health check
router.get('/chat/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Enhanced NodePilot AI chat is running',
    features: ['intent_classification', 'conversation_handling', 'workflow_generation']
  });
});

// Get user credits endpoint for frontend
router.get('/credits', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '') || req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { creditService } = await import('../services/credit/creditService');
    const creditInfo = await creditService.getUserCredits(userId as string);

    return res.status(200).json({
      credits: creditInfo.credits,
      plan: creditInfo.plan,
      trialStatus: {
        isTrialActive: creditInfo.isTrialActive,
        trialStart: creditInfo.trialStart
      }
    });
  } catch (error) {
    logger.error('Error fetching user credits:', error);
    return res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

export default router;
