import type { ICartRepository } from '../../data/repositories/CartRepository';
import type { Cart } from '../models/Order';
import type { Result } from '../../core/types/Result';
import { err } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';
import { validationError } from '../../core/errors/AppError';

export class AddToCartUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(listingId: string, quantity: number): Promise<Result<Cart, AppError>> {
    if (!listingId) return err(validationError('listingId', 'A listing is required'));
    if (quantity <= 0) return err(validationError('quantity', 'Quantity must be at least 1'));

    return this.cartRepository.addItem(listingId, quantity);
  }
}
