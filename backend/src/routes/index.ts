// src/routes/index.ts
import { Router } from 'express';
import workflowRoutes from './workflow.routes';
import creditRoutes from './credit.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import batchRoutes from './batch.routes';
import templateRoutes from './template.routes';

const router = Router();

// Mount route groups
router.use('/workflows', workflowRoutes);
router.use('/credits', creditRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/batch', batchRoutes);
router.use('/templates', templateRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'NodePilot API is running' });
});

export default router;
