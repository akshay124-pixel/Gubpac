import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

interface AccessTokenPayload {
  userId: string;
  email: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}
