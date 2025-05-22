"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockToken = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }
        const token = authHeader.split(' ')[1];
        // PLACEHOLDER: Replace with your actual JWT verification
        // INTEGRATION: This should be integrated with your Clerk authentication
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            // Set user in request object
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role || 'user'
            };
            next();
        }
        catch (error) {
            logger_1.logger.error('Invalid token', { error });
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error', { error });
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.authMiddleware = authMiddleware;
// Mock JWT token generation for development
const generateMockToken = (userId, email, role = 'user') => {
    // PLACEHOLDER: This is only for development purposes
    // INTEGRATION: In production, use your actual authentication system
    return jsonwebtoken_1.default.sign({ sub: userId, email, role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
};
exports.generateMockToken = generateMockToken;
