// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
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
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Check if it's a JWT token or a direct user ID (for internal API calls)
    if (token.includes('.')) {
      // It's a JWT token
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role || 'user'
        };
      } catch (jwtError) {
        logger.error('Invalid JWT token', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // It's a direct user ID (for internal API calls from frontend)
      // This is for internal communication between Next.js API routes and Express backend
      req.user = {
        id: token,
        email: `user-${token}@internal.local`, // Mock email for internal calls
        role: 'user'
      };
      logger.info('Internal API call with user ID', { userId: token });
    }
    
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Mock JWT token generation for development
export const generateMockToken = (userId: string, email: string, role: string = 'user'): string => {
  const payload = { userId, email, role };
  const secret = config.jwt.secret;
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};
