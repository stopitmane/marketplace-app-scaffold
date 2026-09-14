import type { Listing } from '@prisma/client';
import type { ListingsRepository, ListingFilters, Page } from './listings.repository';
import { notFoundError, validationError } from '../../core/errors/AppError';

export class ListingsService {
  constructor(private readonly repo: ListingsRepository) {}

  browse(filters: ListingFilters, cursor: string | null, limit = 20): Promise<Page<Listing>> {
    return this.repo.getPage(filters, cursor, Math.min(limit, 50));
  }

  async getOne(id: string) {
    const listing = await this.repo.findById(id);
    if (!listing) notFoundError('Listing');
    return listing;
  }

  async create(sellerId: string, input: { title: string; description: string; priceCents: number; category: string; imageUrl?: string }) {
    if (!input.title.trim()) validationError('title', 'Title is required');
    if (input.priceCents <= 0) validationError('priceCents', 'Price must be greater than zero');
    return this.repo.create(sellerId, input);
  }
}
