// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Log the error
  logger.error(`Error: ${message}`, {
    path: req.path,
    method: req.method,
    statusCode,
    errorCode,
    stack: err.stack
  });

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      code: errorCode,
      status: statusCode
    }
  });
};
