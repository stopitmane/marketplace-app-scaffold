import type { Listing, ListingFilters, Page } from '../../domain/models/Listing';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export interface BrowseResult {
  page: Page<Listing>;
  /** True when this data came from the local cache because the network
   *  call failed - lets the UI show a "you're offline" banner without the
   *  use-case needing to know HOW the repository decided that. */
  isStale: boolean;
}

export interface IListingsRepository {
  browse(filters: ListingFilters, cursor: string | null): Promise<Result<BrowseResult, AppError>>;
  getOne(id: string): Promise<Result<Listing, AppError>>;
}
