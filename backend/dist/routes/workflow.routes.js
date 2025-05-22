"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/workflow.routes.ts
const express_1 = require("express");
const workflow_controller_1 = require("../controllers/workflow.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all workflow routes
router.use(authMiddleware_1.authMiddleware);
// Workflow routes
router.post('/generate', workflow_controller_1.workflowController.generateWorkflow);
router.get('/', workflow_controller_1.workflowController.getUserWorkflows);
router.get('/:id', workflow_controller_1.workflowController.getWorkflowById);
exports.default = router;
