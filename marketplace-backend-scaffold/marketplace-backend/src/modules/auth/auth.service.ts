import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { AuthRepository } from './auth.repository';
import { conflictError, unauthorizedError, validationError } from '../../core/errors/AppError';
import { env } from '../../config/env';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * All password hashing, token issuing, and validation rules live here -
 * not in the route handler (auth.controller.ts stays a thin adapter) and
 * not in the repository (which knows nothing about bcrypt or JWT).
 */
export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(email: string, password: string, name: string): Promise<Tokens> {
    if (!EMAIL_RE.test(email)) validationError('email', 'Invalid email address');
    if (password.length < 8) validationError('password', 'Password must be at least 8 characters');
    if (!name.trim()) validationError('name', 'Name is required');

    const existing = await this.repo.findByEmail(email);
    if (existing) conflictError('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.repo.createUser({ email, passwordHash, name });
    return this.issueTokens(user.id);
  }

  async login(email: string, password: string): Promise<Tokens> {
    const user = await this.repo.findByEmail(email);
    if (!user) unauthorizedError('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) unauthorizedError('Invalid email or password');

    return this.issueTokens(user.id);
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    const stored = await this.repo.findRefreshToken(refreshToken);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      unauthorizedError('Refresh token is invalid or expired');
    }

    // Rotate: revoke the used token and issue a fresh pair. This limits the
    // blast radius if a refresh token is ever leaked - a stolen token is
    // only valid until its next use, not indefinitely.
    await this.repo.revokeRefreshToken(refreshToken);
    return this.issueTokens(stored.userId);
  }

  private async issueTokens(userId: string): Promise<Tokens> {
    // jsonwebtoken types expiresIn as `number | StringValue` (a template-literal
    // type like '15m'/'1h'), not a plain string - env vars are always plain
    // strings, so this cast is the correct fix, not a type-safety hole: if
    // ACCESS_TOKEN_TTL is malformed, jwt.sign throws at runtime either way.
    const accessToken = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.repo.storeRefreshToken(userId, refreshToken, expiresAt);
    return { accessToken, refreshToken };
  }
}
