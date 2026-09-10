import type { ApiClient } from '../network/ApiClient';
import type { TokenStorage } from '../local/TokenStorage';
import type { IAuthRepository } from './IAuthRepository';
import type { Result } from '../../core/types/Result';
import { ok } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly api: ApiClient,
    private readonly tokenStorage: TokenStorage,
  ) {}

  async register(email: string, password: string, name: string): Promise<Result<void, AppError>> {
    const result = await this.api.request<TokenPair>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
    if (!result.ok) return result;
    await this.tokenStorage.setTokens(result.value.accessToken, result.value.refreshToken);
    return ok(undefined);
  }

  async login(email: string, password: string): Promise<Result<void, AppError>> {
    const result = await this.api.request<TokenPair>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (!result.ok) return result;
    await this.tokenStorage.setTokens(result.value.accessToken, result.value.refreshToken);
    return ok(undefined);
  }

  async logout(): Promise<void> {
    // No server-side revoke-on-logout endpoint on the backend yet - clearing
    // the local refresh token is enough for this app's threat model (it
    // still expires on its own). Add a POST /auth/logout that revokes the
    // stored RefreshToken row if you want server-side revocation too.
    await this.tokenStorage.clear();
  }

  async isAuthenticated(): Promise<boolean> {
    return (await this.tokenStorage.getAccessToken()) !== null;
  }
}
