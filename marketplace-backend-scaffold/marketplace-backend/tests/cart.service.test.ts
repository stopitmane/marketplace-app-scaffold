import { CartService } from '../src/modules/cart/cart.service';
import { AppErrorException } from '../src/core/errors/AppError';

interface FakeListing {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
  sellerId: string;
}

class FakeListingsRepository {
  constructor(public listings: FakeListing[]) {}
  async findById(id: string) {
    return this.listings.find((l) => l.id === id) ?? null;
  }
}

class FakeCartRepository {
  rows: { id: string; userId: string; listingId: string; quantity: number }[] = [];
  private nextId = 1;

  async getItems(userId: string) {
    return this.rows
      .filter((r) => r.userId === userId)
      .map((r) => ({ ...r, listing: (this as any).__listings.find((l: FakeListing) => l.id === r.listingId) }));
  }
  async findItem(userId: string, cartItemId: string) {
    const row = this.rows.find((r) => r.id === cartItemId && r.userId === userId);
    return row ? { ...row, listing: (this as any).__listings.find((l: FakeListing) => l.id === row.listingId) } : null;
  }
  async upsertItem(userId: string, listingId: string, quantity: number) {
    const existing = this.rows.find((r) => r.userId === userId && r.listingId === listingId);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
    const row = { id: `item-${this.nextId++}`, userId, listingId, quantity };
    this.rows.push(row);
    return row;
  }
  async updateQuantity(cartItemId: string, quantity: number) {
    const row = this.rows.find((r) => r.id === cartItemId)!;
    row.quantity = quantity;
    return row;
  }
  async deleteItem(cartItemId: string) {
    this.rows = this.rows.filter((r) => r.id !== cartItemId);
  }
}

function makeService(listings: FakeListing[]) {
  const listingsRepo = new FakeListingsRepository(listings);
  const cartRepo = new FakeCartRepository();
  (cartRepo as any).__listings = listings;
  const service = new CartService(cartRepo as any, listingsRepo as any);
  return { service, cartRepo };
}

const activeListing: FakeListing = {
  id: 'listing-1',
  title: 'Blue Sneakers',
  priceCents: 5000,
  currency: 'NGN',
  isActive: true,
  sellerId: 'seller-1',
};

describe('CartService.addItem', () => {
  it('rejects a quantity of zero or less', async () => {
    const { service } = makeService([activeListing]);
    await expect(service.addItem('buyer-1', 'listing-1', 0)).rejects.toThrow(AppErrorException);
  });

  it('rejects an inactive listing', async () => {
    const { service } = makeService([{ ...activeListing, isActive: false }]);
    await expect(service.addItem('buyer-1', 'listing-1', 1)).rejects.toThrow(AppErrorException);
  });

  it('rejects adding your own listing to your cart', async () => {
    const { service } = makeService([activeListing]);
    await expect(service.addItem('seller-1', 'listing-1', 1)).rejects.toThrow(AppErrorException);
  });

  it('adds a valid item and computes the line total on read', async () => {
    const { service } = makeService([activeListing]);
    await service.addItem('buyer-1', 'listing-1', 2);
    const cart = await service.getCart('buyer-1');
    expect(cart.items).toHaveLength(1);
    // Non-null assertions below are safe: each test just asserted length 1,
    // so index 0 exists - noUncheckedIndexedAccess can't see that from a
    // runtime toHaveLength() check.
    expect(cart.items[0]!.lineTotalCents).toBe(10000);
    expect(cart.totalCents).toBe(10000);
  });

  it('increments quantity instead of duplicating when the same listing is added twice', async () => {
    const { service } = makeService([activeListing]);
    await service.addItem('buyer-1', 'listing-1', 1);
    await service.addItem('buyer-1', 'listing-1', 2);
    const cart = await service.getCart('buyer-1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.quantity).toBe(3);
  });
});

describe('CartService.updateItem', () => {
  it('removes the item when quantity is set to zero', async () => {
    const { service } = makeService([activeListing]);
    await service.addItem('buyer-1', 'listing-1', 1);
    const cart = await service.getCart('buyer-1');
    await service.updateItem('buyer-1', cart.items[0]!.id, 0);
    const after = await service.getCart('buyer-1');
    expect(after.items).toHaveLength(0);
  });

  it('rejects updating a cart item that does not belong to the user', async () => {
    const { service } = makeService([activeListing]);
    await service.addItem('buyer-1', 'listing-1', 1);
    const cart = await service.getCart('buyer-1');
    await expect(service.updateItem('someone-else', cart.items[0]!.id, 5)).rejects.toThrow(AppErrorException);
  });
});
