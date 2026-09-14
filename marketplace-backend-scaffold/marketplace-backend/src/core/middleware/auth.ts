import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorizedError } from '../errors/AppError';
import { env } from '../../config/env';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface AccessTokenPayload {
  sub: string; // userId
}

/** Protects a route: verifies the Bearer access token and sets req.userId. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorizedError('Missing bearer token'));
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.userId = payload.sub;
    next();
  } catch {
    next(unauthorizedError('Invalid or expired token'));
  }
}
