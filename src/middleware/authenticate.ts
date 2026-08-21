import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
