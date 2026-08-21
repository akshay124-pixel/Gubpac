import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody(schema: z.ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Query validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: z.ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Params validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
}
