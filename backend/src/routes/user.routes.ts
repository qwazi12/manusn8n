// src/routes/user.routes.ts
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all user routes
router.use(authMiddleware);

// User routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.get('/settings', userController.getUserSettings);
router.put('/settings', userController.updateUserSettings);

export default router;
