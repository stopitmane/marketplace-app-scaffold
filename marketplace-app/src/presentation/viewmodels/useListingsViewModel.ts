import { useCallback, useEffect, useState } from 'react';
import { container, Tokens } from '../../core/di/container';
import type { IListingsRepository } from '../../data/repositories/IListingsRepository';
import type { IFavouritesRepository } from '../../data/repositories/FavouritesRepository';
import type { Listing, ListingFilters } from '../../domain/models/Listing';
import type { AppError } from '../../core/errors/AppError';

type ViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: AppError }
  | { status: 'success'; listings: Listing[]; hasMore: boolean; isStale: boolean };

export function useListingsViewModel(filters: ListingFilters) {
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const [cursor, setCursor] = useState<string | null>(null);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());

  const listingsRepo = container.resolve<IListingsRepository>(Tokens.ListingsRepository);
  const favouritesRepo = container.resolve<IFavouritesRepository>(Tokens.FavouritesRepository);

  const load = useCallback(
    async (nextCursor: string | null = null) => {
      setState({ status: 'loading' });
      const result = await listingsRepo.browse(filters, nextCursor);

      if (!result.ok) {
        setState({ status: 'error', error: result.error });
        return;
      }
      if (result.value.page.items.length === 0 && !nextCursor) {
        setState({ status: 'empty' });
        return;
      }
      setState({
        status: 'success',
        listings: result.value.page.items,
        hasMore: result.value.page.nextCursor !== null,
        isStale: result.value.isStale,
      });
      setCursor(result.value.page.nextCursor);
    },
    // filters is an object - callers should pass a stable/memoized reference
    // (or primitive fields) to avoid re-fetching on every render.
    [listingsRepo, filters],
  );

  useEffect(() => {
    // Intentional fire-and-forget: load() reports failure via setState
    // (the 'error' branch), so there's nothing further to await or catch here.
    void load();
  }, [load]);

  useEffect(() => {
    favouritesRepo.getAllIds().then((ids) => setFavouriteIds(new Set(ids))).catch(() => {});
  }, [favouritesRepo]);

  const toggleFavourite = useCallback(
    async (listingId: string) => {
      const result = await favouritesRepo.toggle(listingId);
      if (result.ok) {
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          result.value ? next.add(listingId) : next.delete(listingId);
          return next;
        });
      }
    },
    [favouritesRepo],
  );

  return {
    state,
    favouriteIds,
    toggleFavourite,
    retry: () => load(),
    loadMore: () => cursor && load(cursor),
  };
}
