"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/batch.routes.ts
const express_1 = require("express");
const batch_controller_1 = require("../controllers/batch.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all batch routes
router.use(authMiddleware_1.authMiddleware);
// Batch routes
router.post('/create', batch_controller_1.batchController.createBatchJob);
router.get('/status/:id', batch_controller_1.batchController.getBatchJobStatus);
router.get('/user', batch_controller_1.batchController.getUserBatchJobs);
exports.default = router;
