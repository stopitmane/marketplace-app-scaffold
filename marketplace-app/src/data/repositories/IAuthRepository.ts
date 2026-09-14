import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export interface IAuthRepository {
  register(email: string, password: string, name: string): Promise<Result<void, AppError>>;
  login(email: string, password: string): Promise<Result<void, AppError>>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
}
