// src/routes/batch.routes.ts
import { Router } from 'express';
import { batchController } from '../controllers/batch.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all batch routes
router.use(authMiddleware);

// Batch routes
router.post('/create', batchController.createBatchJob);
router.get('/status/:id', batchController.getBatchJobStatus);
router.get('/user', batchController.getUserBatchJobs);

export default router;
