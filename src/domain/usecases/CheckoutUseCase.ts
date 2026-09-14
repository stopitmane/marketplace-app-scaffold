import type { IOrdersRepository } from '../../data/repositories/OrdersRepository';
import type { Order } from '../models/Order';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

/**
 * Deliberately thin - checkout's real complexity (atomicity, price
 * snapshotting, the stale-listing re-check) lives server-side in
 * marketplace-backend's OrdersService, not duplicated here. This use-case
 * exists mainly so the viewmodel has a single testable seam to mock,
 * matching the app's layering convention rather than because there's
 * meaningful client-side logic to isolate.
 */
export class CheckoutUseCase {
  constructor(private readonly ordersRepository: IOrdersRepository) {}

  execute(): Promise<Result<Order, AppError>> {
    return this.ordersRepository.checkout();
  }
}
