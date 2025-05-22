"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config/config.ts
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Configuration object with placeholders for external services
exports.config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    // PLACEHOLDER: Add your Supabase credentials
    // INTEGRATION: Sign up at https://supabase.com and create a new project
    supabase: {
        url: process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co',
        anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
    },
    // PLACEHOLDER: Add your OpenAI API key
    // INTEGRATION: Sign up at https://openai.com and get an API key
    openai: {
        apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
    },
    // PLACEHOLDER: Add your Redis connection URL
    // INTEGRATION: Set up Redis locally or use a cloud provider
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    // PLACEHOLDER: Add your Clerk secret key
    // INTEGRATION: Sign up at https://clerk.dev and get your secret key
    clerk: {
        secretKey: process.env.CLERK_SECRET_KEY || 'your-clerk-secret-key'
    },
    // JWT configuration for authentication
    jwt: {
        secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
};
