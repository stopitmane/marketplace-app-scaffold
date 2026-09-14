import { AddToCartUseCase } from '../src/domain/usecases/AddToCartUseCase';
import type { ICartRepository } from '../src/data/repositories/CartRepository';
import { ok } from '../src/core/types/Result';
import type { Cart } from '../src/domain/models/Order';

class FakeCartRepository implements ICartRepository {
  public addItemCalls: { listingId: string; quantity: number }[] = [];
  private cart: Cart = { items: [], totalCents: 0 };

  async getCart() {
    return ok(this.cart);
  }
  async addItem(listingId: string, quantity: number) {
    this.addItemCalls.push({ listingId, quantity });
    return ok(this.cart);
  }
  async updateItem() {
    return ok(this.cart);
  }
  async removeItem() {
    return ok<void>(undefined);
  }
}

describe('AddToCartUseCase', () => {
  it('rejects a missing listing id', async () => {
    const repo = new FakeCartRepository();
    const useCase = new AddToCartUseCase(repo);

    const result = await useCase.execute('', 1);

    expect(result.ok).toBe(false);
    expect(repo.addItemCalls).toHaveLength(0);
  });

  it('rejects a zero or negative quantity', async () => {
    const repo = new FakeCartRepository();
    const useCase = new AddToCartUseCase(repo);

    const result = await useCase.execute('listing-1', 0);

    expect(result.ok).toBe(false);
    expect(repo.addItemCalls).toHaveLength(0);
  });

  it('delegates to the repository with valid input', async () => {
    const repo = new FakeCartRepository();
    const useCase = new AddToCartUseCase(repo);

    const result = await useCase.execute('listing-1', 2);

    expect(result.ok).toBe(true);
    expect(repo.addItemCalls).toEqual([{ listingId: 'listing-1', quantity: 2 }]);
  });
});
