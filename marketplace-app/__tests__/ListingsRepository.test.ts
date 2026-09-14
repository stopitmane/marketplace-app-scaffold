import { ListingsRepository } from '../src/data/repositories/ListingsRepository';
import { ok, err } from '../src/core/types/Result';
import { networkError } from '../src/core/errors/AppError';
import type { Listing } from '../src/domain/models/Listing';

const sampleListing: Listing = {
  id: 'l1',
  title: 'Blue Sneakers',
  description: 'Worn twice',
  priceCents: 5000,
  currency: 'NGN',
  category: 'shoes',
  sellerId: 'seller-1',
  isActive: true,
  createdAt: new Date().toISOString(),
};

function makeFakeApi(response: 'success' | 'network-error') {
  return {
    request: jest.fn().mockResolvedValue(
      response === 'success' ? ok({ items: [sampleListing], nextCursor: null }) : err(networkError('offline', true)),
    ),
  };
}

function makeFakeCache(cached: Listing[] | null) {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn().mockResolvedValue(cached ? { listings: cached, cachedAt: new Date().toISOString() } : null),
  };
}

const fakeLogger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('ListingsRepository.browse', () => {
  it('caches the first unfiltered page on a successful fetch', async () => {
    const api = makeFakeApi('success');
    const cache = makeFakeCache(null);
    const repo = new ListingsRepository(api as any, cache as any, fakeLogger);

    const result = await repo.browse({}, null);

    expect(result.ok).toBe(true);
    expect(cache.save).toHaveBeenCalledWith([sampleListing]);
  });

  it('does not cache a filtered or paginated request', async () => {
    const api = makeFakeApi('success');
    const cache = makeFakeCache(null);
    const repo = new ListingsRepository(api as any, cache as any, fakeLogger);

    await repo.browse({ category: 'shoes' }, null);
    await repo.browse({}, 'some-cursor');

    expect(cache.save).not.toHaveBeenCalled();
  });

  it('falls back to cached listings on a network failure for the plain first page', async () => {
    const api = makeFakeApi('network-error');
    const cache = makeFakeCache([sampleListing]);
    const repo = new ListingsRepository(api as any, cache as any, fakeLogger);

    const result = await repo.browse({}, null);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isStale).toBe(true);
      expect(result.value.page.items).toEqual([sampleListing]);
    }
  });

  it('returns the network error when there is no cache to fall back to', async () => {
    const api = makeFakeApi('network-error');
    const cache = makeFakeCache(null);
    const repo = new ListingsRepository(api as any, cache as any, fakeLogger);

    const result = await repo.browse({}, null);

    expect(result.ok).toBe(false);
  });

  it('does NOT fall back to cache for a failed search - a stale unrelated result would be misleading', async () => {
    const api = makeFakeApi('network-error');
    const cache = makeFakeCache([sampleListing]);
    const repo = new ListingsRepository(api as any, cache as any, fakeLogger);

    const result = await repo.browse({ searchQuery: 'shoes' }, null);

    expect(result.ok).toBe(false);
    expect(cache.load).not.toHaveBeenCalled();
  });
});
