import { OrdersService } from '../src/modules/orders/orders.service';
import { AppErrorException } from '../src/core/errors/AppError';
import type { CheckoutLine } from '../src/modules/orders/orders.repository';

interface FakeListing {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
}

class FakeListingsRepository {
  constructor(public listings: FakeListing[]) {}
  async findById(id: string) {
    return this.listings.find((l) => l.id === id) ?? null;
  }
}

class FakeCartRepository {
  constructor(private items: { listingId: string; quantity: number; listing: FakeListing }[]) {}
  async getItems(_userId: string) {
    return this.items;
  }
}

class FakeOrdersRepository {
  public checkoutCalls: { userId: string; lines: CheckoutLine[]; totalCents: number; currency: string }[] = [];

  async checkout(userId: string, lines: CheckoutLine[], totalCents: number, currency: string) {
    this.checkoutCalls.push({ userId, lines, totalCents, currency });
    return { id: 'order-1', buyerId: userId, totalCents, currency, items: lines };
  }
  async findByIdForUser() {
    return null;
  }
  async listForUser() {
    return { items: [], nextCursor: null };
  }
}

const shoes: FakeListing = { id: 'listing-1', title: 'Shoes', priceCents: 5000, currency: 'NGN', isActive: true };
const bag: FakeListing = { id: 'listing-2', title: 'Bag', priceCents: 3000, currency: 'NGN', isActive: true };

function makeService(cartItems: { listingId: string; quantity: number; listing: FakeListing }[], listings: FakeListing[]) {
  const ordersRepo = new FakeOrdersRepository();
  const cartRepo = new FakeCartRepository(cartItems);
  const listingsRepo = new FakeListingsRepository(listings);
  const service = new OrdersService(ordersRepo as any, cartRepo as any, listingsRepo as any);
  return { service, ordersRepo };
}

describe('OrdersService.checkout', () => {
  it('rejects checkout with an empty cart', async () => {
    const { service } = makeService([], []);
    await expect(service.checkout('buyer-1')).rejects.toThrow(AppErrorException);
  });

  it('rejects checkout when a cart item is no longer active (fresh re-check)', async () => {
    const cartItems = [{ listingId: shoes.id, quantity: 1, listing: shoes }];
    // The listing has since been deactivated - the cart's cached copy doesn't know that yet.
    const { service } = makeService(cartItems, [{ ...shoes, isActive: false }]);
    await expect(service.checkout('buyer-1')).rejects.toThrow(AppErrorException);
  });

  it('computes the correct total and snapshots unit prices at checkout time', async () => {
    const cartItems = [
      { listingId: shoes.id, quantity: 2, listing: shoes }, // 5000 * 2 = 10000
      { listingId: bag.id, quantity: 1, listing: bag }, // 3000 * 1 = 3000
    ];
    const { service, ordersRepo } = makeService(cartItems, [shoes, bag]);

    await service.checkout('buyer-1');

    expect(ordersRepo.checkoutCalls).toHaveLength(1);
    // Non-null assertion is safe: toHaveLength(1) above just confirmed index 0 exists.
    const call = ordersRepo.checkoutCalls[0]!;
    expect(call.totalCents).toBe(13000);
    expect(call.lines).toEqual([
      { listingId: shoes.id, quantity: 2, unitPriceCents: 5000 },
      { listingId: bag.id, quantity: 1, unitPriceCents: 3000 },
    ]);
  });

  it('uses the freshly-fetched listing price, not a stale cart-cached price', async () => {
    // Cart was cached when the shoes were 5000; price has since changed to 4500.
    const cartItems = [{ listingId: shoes.id, quantity: 1, listing: shoes }];
    const { service, ordersRepo } = makeService(cartItems, [{ ...shoes, priceCents: 4500 }]);

    await service.checkout('buyer-1');

    // Non-null assertions safe: checkout() was just awaited, so exactly one
    // call with exactly one line is guaranteed by this test's setup.
    expect(ordersRepo.checkoutCalls[0]!.lines[0]!.unitPriceCents).toBe(4500);
    expect(ordersRepo.checkoutCalls[0]!.totalCents).toBe(4500);
  });
});
