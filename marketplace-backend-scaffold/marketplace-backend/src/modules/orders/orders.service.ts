import type { OrdersRepository, CheckoutLine } from './orders.repository';
import type { CartRepository } from '../cart/cart.repository';
import type { ListingsRepository } from '../listings/listings.repository';
import { notFoundError, validationError } from '../../core/errors/AppError';

export class OrdersService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly cartRepo: CartRepository,
    private readonly listingsRepo: ListingsRepository,
  ) {}

  async checkout(userId: string) {
    const cartItems = await this.cartRepo.getItems(userId);
    if (cartItems.length === 0) validationError('cart', 'Your cart is empty');

    // Re-check each listing fresh, right before writing the order - the
    // cart's joined `listing` data could be seconds or days stale. A
    // listing deactivated after being carted must not silently ship.
    // Decision: reject the WHOLE checkout rather than partially fulfilling
    // it, so the buyer gets one clear error instead of a surprise partial
    // order. (The alternative - drop the stale item and proceed - is
    // equally defensible; document whichever you pick.)
    const lines: CheckoutLine[] = [];
    for (const item of cartItems) {
      const listing = await this.listingsRepo.findById(item.listingId);
      if (!listing || !listing.isActive) {
        validationError('cart', `"${item.listing.title}" is no longer available - remove it from your cart to continue`);
      }
      lines.push({ listingId: listing.id, quantity: item.quantity, unitPriceCents: listing.priceCents });
    }

    const totalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
    const currency = cartItems[0]?.listing?.currency ?? 'USD'; // single-currency assumption - fine for a portfolio-scale marketplace

    return this.ordersRepo.checkout(userId, lines, totalCents, currency);
  }

  async listOrders(userId: string, cursor: string | null, limit = 20) {
    return this.ordersRepo.listForUser(userId, cursor, Math.min(limit, 50));
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.ordersRepo.findByIdForUser(orderId, userId);
    if (!order) notFoundError('Order');
    return order;
  }
}
