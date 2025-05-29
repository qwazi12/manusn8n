// src/routes/index.ts
import { Router } from 'express';
import workflowRoutes from './workflow.routes';
import creditRoutes from './credit.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import batchRoutes from './batch.routes';
import templateRoutes from './template.routes';
import pricingRoutes from './pricing.routes';
import { aiService } from '../services/ai/aiService';

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

    const result = await aiService.generateWorkflow({
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
    console.error('Test AI error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
