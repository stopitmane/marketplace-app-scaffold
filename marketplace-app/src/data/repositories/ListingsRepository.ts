import type { ApiClient } from '../network/ApiClient';
import type { ListingsCache } from '../local/ListingsCache';
import type { IListingsRepository, BrowseResult } from './IListingsRepository';
import type { Listing, ListingFilters, Page } from '../../domain/models/Listing';
import type { Result } from '../../core/types/Result';
import { ok, err } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';
import type { Logger } from '../../core/logger/Logger';

export class ListingsRepository implements IListingsRepository {
  constructor(
    private readonly api: ApiClient,
    private readonly cache: ListingsCache,
    private readonly logger: Logger,
  ) {}

  async browse(filters: ListingFilters, cursor: string | null): Promise<Result<BrowseResult, AppError>> {
    const query = new URLSearchParams({
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.searchQuery ? { q: filters.searchQuery } : {}),
      ...(filters.maxPriceCents ? { maxPrice: String(filters.maxPriceCents) } : {}),
      ...(cursor ? { cursor } : {}),
    });

    const result = await this.api.request<Page<Listing>>(`/listings?${query.toString()}`);

    if (result.ok) {
      // Only cache the first, unfiltered page - that's the one screen worth
      // showing offline; caching every filtered/paginated combination isn't
      // worth the complexity for what this cache is for (a fallback view,
      // not a full offline browse experience).
      if (!cursor && !filters.category && !filters.searchQuery) {
        await this.cache.save(result.value.items).catch((cause) => this.logger.warn('Failed to cache listings', { cause }));
      }
      return ok({ page: result.value, isStale: false });
    }

    // Network failed - fall back to whatever was last cached, but only for
    // the plain first-page case; a failed *search* should show an error,
    // not silently swap in unrelated cached listings.
    if (result.error.type === 'network' && !cursor && !filters.category && !filters.searchQuery) {
      const cached = await this.cache.load().catch(() => null);
      if (cached) {
        this.logger.info('Serving cached listings after network failure');
        return ok({ page: { items: cached.listings, nextCursor: null }, isStale: true });
      }
    }

    return err(result.error);
  }

  async getOne(id: string): Promise<Result<Listing, AppError>> {
    return this.api.request<Listing>(`/listings/${id}`);
  }
}
