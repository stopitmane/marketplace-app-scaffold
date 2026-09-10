import type { IAuthRepository } from '../../data/repositories/IAuthRepository';
import type { Result } from '../../core/types/Result';
import { err } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';
import { validationError } from '../../core/errors/AppError';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<Result<void, AppError>> {
    if (!EMAIL_RE.test(email)) return err(validationError('email', 'Enter a valid email address'));
    if (password.length === 0) return err(validationError('password', 'Password is required'));

    return this.authRepository.login(email, password);
  }
}
