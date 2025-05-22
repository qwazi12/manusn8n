"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/template.routes.ts
const express_1 = require("express");
const template_controller_1 = require("../controllers/template.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all template routes
router.use(authMiddleware_1.authMiddleware);
// Template routes
router.get('/', template_controller_1.templateController.getAllTemplates);
router.get('/categories', template_controller_1.templateController.getAllCategories);
router.get('/category/:id', template_controller_1.templateController.getTemplatesByCategory);
router.get('/:id', template_controller_1.templateController.getTemplateById);
router.post('/', template_controller_1.templateController.createTemplate);
router.put('/:id', template_controller_1.templateController.updateTemplate);
router.delete('/:id', template_controller_1.templateController.deleteTemplate);
exports.default = router;
