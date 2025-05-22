"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const workflow_routes_1 = __importDefault(require("./workflow.routes"));
const credit_routes_1 = __importDefault(require("./credit.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const batch_routes_1 = __importDefault(require("./batch.routes"));
const template_routes_1 = __importDefault(require("./template.routes"));
const router = (0, express_1.Router)();
// Mount route groups
router.use('/workflows', workflow_routes_1.default);
router.use('/credits', credit_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/auth', auth_routes_1.default);
router.use('/batch', batch_routes_1.default);
router.use('/templates', template_routes_1.default);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'NodePilot API is running' });
});
exports.default = router;
