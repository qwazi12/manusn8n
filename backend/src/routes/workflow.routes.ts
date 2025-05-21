// src/routes/workflow.routes.ts
import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all workflow routes
router.use(authMiddleware);

// Workflow routes
router.post('/generate', workflowController.generateWorkflow);
router.get('/', workflowController.getUserWorkflows);
router.get('/:id', workflowController.getWorkflowById);

export default router;
