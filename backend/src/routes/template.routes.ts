// src/routes/template.routes.ts
import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all template routes
router.use(authMiddleware);

// Template routes
router.get('/', templateController.getAllTemplates);
router.get('/categories', templateController.getAllCategories);
router.get('/category/:id', templateController.getTemplatesByCategory);
router.get('/:id', templateController.getTemplateById);
router.post('/', templateController.createTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

export default router;
