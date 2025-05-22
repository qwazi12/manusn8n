"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Auth routes
router.post('/login', auth_controller_1.authController.login);
router.post('/register', auth_controller_1.authController.register);
router.post('/verify', auth_controller_1.authController.verifyToken);
exports.default = router;
