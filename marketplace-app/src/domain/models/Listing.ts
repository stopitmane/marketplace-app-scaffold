export interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  category: string;
  imageUrl?: string;
  sellerId: string;
  isActive: boolean;
  createdAt: string;
}

export interface ListingFilters {
  category?: string;
  searchQuery?: string;
  maxPriceCents?: number;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
