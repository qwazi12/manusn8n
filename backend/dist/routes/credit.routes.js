"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/credit.routes.ts
const express_1 = require("express");
const credit_controller_1 = require("../controllers/credit.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all credit routes
router.use(authMiddleware_1.authMiddleware);
// Credit routes
router.get('/', credit_controller_1.creditController.getUserCredits);
router.get('/history', credit_controller_1.creditController.getCreditHistory);
router.post('/purchase', credit_controller_1.creditController.purchaseCredits);
exports.default = router;
