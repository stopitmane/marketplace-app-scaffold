import type { PrismaClient, User } from '@prisma/client';

/**
 * The service layer depends on this class's public methods, never on
 * `prisma` directly - that's what makes AuthService testable with a fake
 * repository (see tests/auth.service.test.ts) with zero real database.
 */
export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  revokeRefreshToken(token: string) {
    return this.prisma.refreshToken.update({ where: { token }, data: { revokedAt: new Date() } });
  }
}
