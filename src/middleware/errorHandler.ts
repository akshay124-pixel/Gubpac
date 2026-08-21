import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details || {},
    });
  }

  // Handle unknown errors
  const statusCode = 500;
  const response: { error: string; code: string; details?: unknown } = {
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  };

  // Only expose stack trace in development
  if (env.NODE_ENV === 'development') {
    response.details = { message: err.message, stack: err.stack };
  }

  return res.status(statusCode).json(response);
}
