import type { IListingsRepository, BrowseResult } from '../../data/repositories/IListingsRepository';
import type { ListingFilters } from '../models/Listing';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export class BrowseListingsUseCase {
  constructor(private readonly repository: IListingsRepository) {}

  execute(filters: ListingFilters, cursor: string | null = null): Promise<Result<BrowseResult, AppError>> {
    return this.repository.browse(filters, cursor);
  }
}
