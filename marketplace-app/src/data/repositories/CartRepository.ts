import type { ApiClient } from '../network/ApiClient';
import type { Cart } from '../../domain/models/Order';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export interface ICartRepository {
  getCart(): Promise<Result<Cart, AppError>>;
  addItem(listingId: string, quantity: number): Promise<Result<Cart, AppError>>;
  updateItem(cartItemId: string, quantity: number): Promise<Result<Cart, AppError>>;
  removeItem(cartItemId: string): Promise<Result<void, AppError>>;
}

/**
 * Deliberately thin, no local cache: the cart is server-backed only. Unlike
 * listings (read-mostly, safe to show stale), a cart is a set of pending
 * writes - showing a stale local cart while offline risks the user
 * checking out against quantities or prices that no longer match the
 * server, which is a worse experience than "you're offline, try again."
 */
export class CartRepository implements ICartRepository {
  constructor(private readonly api: ApiClient) {}

  getCart(): Promise<Result<Cart, AppError>> {
    return this.api.request<Cart>('/cart');
  }

  addItem(listingId: string, quantity: number): Promise<Result<Cart, AppError>> {
    return this.api.request<Cart>('/cart/items', { method: 'POST', body: { listingId, quantity } });
  }

  updateItem(cartItemId: string, quantity: number): Promise<Result<Cart, AppError>> {
    return this.api.request<Cart>(`/cart/items/${cartItemId}`, { method: 'PATCH', body: { quantity } });
  }

  async removeItem(cartItemId: string): Promise<Result<void, AppError>> {
    return this.api.request<void>(`/cart/items/${cartItemId}`, { method: 'DELETE' });
  }
}
