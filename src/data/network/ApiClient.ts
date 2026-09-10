import { config } from '../../core/config/env';
import { AppError, networkError, unknownError } from '../../core/errors/AppError';
import { Result, ok, err } from '../../core/types/Result';
import type { Logger } from '../../core/logger/Logger';
import type { TokenStorage } from '../local/TokenStorage';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  maxRetries?: number;
  /** Internal - set true only for the refresh call itself, to avoid infinite recursion. */
  skipAuthRefresh?: boolean;
}

interface BackendErrorBody {
  error: { type: string; message: string };
}

export class ApiClient {
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly tokenStorage: TokenStorage,
  ) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<Result<T, AppError>> {
    const maxRetries = options.maxRetries ?? 3;
    let attempt = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const token = options.skipAuthRefresh ? null : await this.tokenStorage.getAccessToken();
        const response = await fetch(`${config.apiBaseUrl}${path}`, {
          method: options.method ?? 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        // One automatic refresh-and-retry per request, never a loop - if
        // the retried request is ALSO a 401, the refresh token itself is
        // dead and the caller should route to the login screen, not spin.
        if (response.status === 401 && !options.skipAuthRefresh) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.request<T>(path, { ...options, skipAuthRefresh: false, maxRetries: 0 });
          }
          return err({ type: 'unauthorized', message: 'Session expired - please log in again' });
        }

        if (response.status >= 500 && attempt < maxRetries) {
          await this.backoff(attempt);
          attempt++;
          continue;
        }

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as BackendErrorBody | null;
          if (body?.error) {
            return err(body.error as AppError);
          }
          return err(networkError(`Request failed: ${response.status}`, response.status >= 500));
        }

        if (response.status === 204) return ok(undefined as T);
        const data = (await response.json()) as T;
        return ok(data);
      } catch (cause) {
        if (attempt < maxRetries) {
          await this.backoff(attempt);
          attempt++;
          continue;
        }
        this.logger.error('Network request failed after retries', cause, { path });
        return err(unknownError(cause));
      }
    }
  }

  /** Coalesces concurrent 401s into a single refresh call, not one per in-flight request. */
  private refreshAccessToken(): Promise<boolean> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.doRefresh().finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = await this.tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    const result = await this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuthRefresh: true,
      maxRetries: 0,
    });

    if (!result.ok) {
      await this.tokenStorage.clear();
      return false;
    }
    await this.tokenStorage.setTokens(result.value.accessToken, result.value.refreshToken);
    return true;
  }

  private backoff(attempt: number): Promise<void> {
    const base = 500 * 2 ** attempt;
    const jitter = Math.random() * 100;
    return new Promise((resolve) => setTimeout(resolve, base + jitter));
  }
}
