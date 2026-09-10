import { LoginUseCase } from '../src/domain/usecases/LoginUseCase';
import type { IAuthRepository } from '../src/data/repositories/IAuthRepository';
import { ok } from '../src/core/types/Result';

class FakeAuthRepository implements IAuthRepository {
  public loginCalls: { email: string; password: string }[] = [];
  async register() {
    return ok<void>(undefined);
  }
  async login(email: string, password: string) {
    this.loginCalls.push({ email, password });
    return ok<void>(undefined);
  }
  async logout() {}
  async isAuthenticated() {
    return true;
  }
}

describe('LoginUseCase', () => {
  it('rejects an invalid email before touching the repository', async () => {
    const repo = new FakeAuthRepository();
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute('not-an-email', 'password123');

    expect(result.ok).toBe(false);
    expect(repo.loginCalls).toHaveLength(0);
  });

  it('rejects an empty password', async () => {
    const repo = new FakeAuthRepository();
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute('jane@example.com', '');

    expect(result.ok).toBe(false);
    expect(repo.loginCalls).toHaveLength(0);
  });

  it('delegates to the repository when input is valid', async () => {
    const repo = new FakeAuthRepository();
    const useCase = new LoginUseCase(repo);

    const result = await useCase.execute('jane@example.com', 'password123');

    expect(result.ok).toBe(true);
    expect(repo.loginCalls).toEqual([{ email: 'jane@example.com', password: 'password123' }]);
  });
});
