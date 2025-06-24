// src/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify', authController.verifyToken);

export default router;
