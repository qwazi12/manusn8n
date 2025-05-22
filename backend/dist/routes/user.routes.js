"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all user routes
router.use(authMiddleware_1.authMiddleware);
// User routes
router.get('/profile', user_controller_1.userController.getUserProfile);
router.put('/profile', user_controller_1.userController.updateUserProfile);
router.get('/settings', user_controller_1.userController.getUserSettings);
router.put('/settings', user_controller_1.userController.updateUserSettings);
exports.default = router;
