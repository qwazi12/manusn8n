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

    // Get user credits if workflow was generated (credits were used)
    let creditsRemaining;
    if (result.workflow && result.success) {
      try {
        // Import credit service to get current credits
        const { creditService } = await import('../services/credit/creditService');
        const creditInfo = await creditService.getUserCredits(userId);
        creditsRemaining = creditInfo.credits;
      } catch (creditError) {
        logger.error('Error fetching user credits:', creditError);
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

export default router;
