import type { PrismaClient, Prisma, Listing } from '@prisma/client';

export interface ListingFilters {
  category?: string;
  searchQuery?: string;
  maxPriceCents?: number;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export class ListingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getPage(filters: ListingFilters, cursor: string | null, limit: number): Promise<Page<Listing>> {
    const where: Prisma.ListingWhereInput = {
      isActive: true,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.maxPriceCents ? { priceCents: { lte: filters.maxPriceCents } } : {}),
      ...(filters.searchQuery
        ? { title: { contains: filters.searchQuery, mode: 'insensitive' as const } }
        : {}),
    };

    // Cursor pagination on (createdAt, id) rather than OFFSET: stays correct
    // even as new listings are inserted between page requests, and stays
    // fast at page 500 instead of degrading like OFFSET does.
    const items = await this.prisma.listing.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    const lastItem = page.at(-1);
    return { items: page, nextCursor: hasMore && lastItem ? lastItem.id : null };
  }

  findById(id: string) {
    return this.prisma.listing.findUnique({ where: { id } });
  }

  create(sellerId: string, data: { title: string; description: string; priceCents: number; category: string; imageUrl?: string }) {
    return this.prisma.listing.create({ data: { ...data, sellerId } });
  }
}
