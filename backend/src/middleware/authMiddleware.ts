// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Set user in request object
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || 'user'
      };
      
      next();
    } catch (error) {
      logger.error('Invalid token', { error });
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    logger.error('Auth middleware error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Mock JWT token generation for development
export const generateMockToken = (userId: string, email: string, role: string = 'user'): string => {
  // PLACEHOLDER: This is only for development purposes
  // INTEGRATION: In production, use your actual authentication system
  return jwt.sign(
    { sub: userId, email, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};
