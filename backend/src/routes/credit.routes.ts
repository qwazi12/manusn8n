// src/routes/credit.routes.ts
import { Router } from 'express';
import { creditController } from '../controllers/credit.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all credit routes
router.use(authMiddleware);

// Credit routes
router.get('/', creditController.getUserCredits);
router.get('/history', creditController.getCreditHistory);
router.post('/purchase', creditController.purchaseCredits);

export default router;
