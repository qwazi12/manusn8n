// Enhanced Routes for NodePilot Backend
// Integrates with existing Express.js route structure

import express from 'express';
import { EnhancedWorkflowController } from '../controllers/enhancedWorkflowController';

const router = express.Router();
const enhancedWorkflowController = new EnhancedWorkflowController();

// Enhanced chat endpoint - main entry point for intelligent conversations
router.post('/chat/message', async (req, res) => {
  await enhancedWorkflowController.processChat(req, res);
});

// Legacy workflow generation (for backward compatibility)
router.post('/workflows/generate', async (req, res) => {
  await enhancedWorkflowController.generateWorkflow(req, res);
});

// Conversation management endpoints
router.get('/conversations/:userId/:conversationId', async (req, res) => {
  await enhancedWorkflowController.getConversationHistory(req, res);
});

router.get('/conversations/:userId', async (req, res) => {
  await enhancedWorkflowController.getUserConversations(req, res);
});

// Health check for enhanced features
router.get('/chat/health', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced NodePilot chat service is running',
    features: {
      openaiConversations: true,
      claudeWorkflowGeneration: true,
      intentClassification: true,
      conversationMemory: true
    },
    timestamp: new Date().toISOString()
  });
});

export default router;

