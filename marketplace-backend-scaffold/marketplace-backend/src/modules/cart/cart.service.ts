import type { CartRepository } from './cart.repository';
import type { ListingsRepository } from '../listings/listings.repository';
import { forbiddenError, notFoundError, validationError } from '../../core/errors/AppError';

export interface CartItemView {
  id: string;
  listingId: string;
  title: string;
  priceCents: number;
  currency: string;
  quantity: number;
  lineTotalCents: number;
}

export interface CartView {
  items: CartItemView[];
  totalCents: number;
}

export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly listingsRepo: ListingsRepository,
  ) {}

  async getCart(userId: string): Promise<CartView> {
    const rows = await this.cartRepo.getItems(userId);
    const items = rows.map((row) => ({
      id: row.id,
      listingId: row.listingId,
      title: row.listing.title,
      priceCents: row.listing.priceCents,
      currency: row.listing.currency,
      quantity: row.quantity,
      lineTotalCents: row.listing.priceCents * row.quantity,
    }));
    return { items, totalCents: items.reduce((sum, i) => sum + i.lineTotalCents, 0) };
  }

  async addItem(userId: string, listingId: string, quantity: number): Promise<void> {
    if (quantity <= 0) validationError('quantity', 'Quantity must be at least 1');

    const listing = await this.listingsRepo.findById(listingId);
    if (!listing || !listing.isActive) notFoundError('Listing');
    if (listing.sellerId === userId) forbiddenError('You cannot add your own listing to your cart');

    await this.cartRepo.upsertItem(userId, listingId, quantity);
  }

  async updateItem(userId: string, cartItemId: string, quantity: number): Promise<void> {
    const item = await this.cartRepo.findItem(userId, cartItemId);
    if (!item) notFoundError('Cart item');

    if (quantity <= 0) {
      await this.cartRepo.deleteItem(cartItemId);
      return;
    }
    await this.cartRepo.updateQuantity(cartItemId, quantity);
  }

  async removeItem(userId: string, cartItemId: string): Promise<void> {
    const item = await this.cartRepo.findItem(userId, cartItemId);
    if (!item) notFoundError('Cart item');
    await this.cartRepo.deleteItem(cartItemId);
  }
}
