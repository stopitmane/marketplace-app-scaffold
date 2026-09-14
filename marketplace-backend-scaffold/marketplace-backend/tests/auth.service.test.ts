import bcrypt from 'bcryptjs';
import { AuthService } from '../src/modules/auth/auth.service';
import type { AuthRepository } from '../src/modules/auth/auth.repository';
import { AppErrorException } from '../src/core/errors/AppError';

// Required env vars (DATABASE_URL, JWT_*_SECRET) are set in tests/setupEnv.js,
// which Jest runs before this file's imports - setting them here instead
// wouldn't work, since ES module imports are hoisted above any code in this
// file, including these lines.

/**
 * A fake repository backed by an in-memory array. This is the entire
 * payoff of the repository pattern: AuthService's rules (email format,
 * password length, duplicate detection, token rotation) are tested with
 * no Postgres, no Docker, no network - just plain Jest.
 */
class FakeAuthRepository {
  users: { id: string; email: string; passwordHash: string; name: string }[] = [];
  refreshTokens: { token: string; userId: string; expiresAt: Date; revokedAt: Date | null }[] = [];
  private nextId = 1;

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async createUser(data: { email: string; passwordHash: string; name: string }) {
    const user = { id: `user-${this.nextId++}`, ...data };
    this.users.push(user);
    return user;
  }
  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    this.refreshTokens.push({ token, userId, expiresAt, revokedAt: null });
  }
  async findRefreshToken(token: string) {
    return this.refreshTokens.find((t) => t.token === token) ?? null;
  }
  async revokeRefreshToken(token: string) {
    const entry = this.refreshTokens.find((t) => t.token === token);
    if (entry) entry.revokedAt = new Date();
  }
}

function makeService() {
  const repo = new FakeAuthRepository();
  const service = new AuthService(repo as unknown as AuthRepository);
  return { repo, service };
}

describe('AuthService.register', () => {
  it('rejects an invalid email', async () => {
    const { service } = makeService();
    await expect(service.register('not-an-email', 'password123', 'Jane')).rejects.toThrow(AppErrorException);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const { service } = makeService();
    await expect(service.register('jane@example.com', 'short', 'Jane')).rejects.toThrow(AppErrorException);
  });

  it('rejects registering an email that already exists', async () => {
    const { service } = makeService();
    await service.register('jane@example.com', 'password123', 'Jane');
    await expect(service.register('jane@example.com', 'password123', 'Jane')).rejects.toThrow(AppErrorException);
  });

  it('stores a hashed password, not the plaintext', async () => {
    const { repo, service } = makeService();
    await service.register('jane@example.com', 'password123', 'Jane');
    // Non-null assertion is safe here: the line above just registered exactly
    // one user, so index 0 exists - noUncheckedIndexedAccess just can't infer
    // that from a runtime array length.
    expect(repo.users[0]!.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', repo.users[0]!.passwordHash)).toBe(true);
  });

  it('returns an access and refresh token pair on success', async () => {
    const { service } = makeService();
    const tokens = await service.register('jane@example.com', 'password123', 'Jane');
    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
  });
});

describe('AuthService.login', () => {
  it('rejects an unknown email', async () => {
    const { service } = makeService();
    await expect(service.login('nobody@example.com', 'password123')).rejects.toThrow(AppErrorException);
  });

  it('rejects a wrong password', async () => {
    const { service } = makeService();
    await service.register('jane@example.com', 'password123', 'Jane');
    await expect(service.login('jane@example.com', 'wrong-password')).rejects.toThrow(AppErrorException);
  });

  it('succeeds with correct credentials', async () => {
    const { service } = makeService();
    await service.register('jane@example.com', 'password123', 'Jane');
    const tokens = await service.login('jane@example.com', 'password123');
    expect(tokens.accessToken).toEqual(expect.any(String));
  });
});

describe('AuthService.refresh', () => {
  it('rotates the refresh token: the old one is revoked after use', async () => {
    const { repo, service } = makeService();
    const { refreshToken } = await service.register('jane@example.com', 'password123', 'Jane');

    await service.refresh(refreshToken);

    const oldEntry = repo.refreshTokens.find((t) => t.token === refreshToken);
    expect(oldEntry?.revokedAt).not.toBeNull();
  });

  it('rejects a revoked refresh token', async () => {
    const { service } = makeService();
    const { refreshToken } = await service.register('jane@example.com', 'password123', 'Jane');

    await service.refresh(refreshToken); // first use rotates/revokes it
    await expect(service.refresh(refreshToken)).rejects.toThrow(AppErrorException); // second use must fail
  });
});
