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
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Invalid token', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Mock JWT token generation for development
export const generateMockToken = (userId: string, email: string, role: string = 'user'): string => {
  // PLACEHOLDER: This is only for development purposes
  // INTEGRATION: In production, use your actual authentication system
  const payload = { sub: userId, email, role };
  const secret = config.jwt.secret;
  const options: SignOptions = { expiresIn: '1d' };
  
  return jwt.sign(payload, secret, options);
};
