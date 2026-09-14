# Orders module (checkout simulation)

Built end-to-end: `orders.repository.ts` -> `orders.service.ts` -> `orders.controller.ts` -> `orders.routes.ts`.

**`POST /orders/checkout`** is the module's centerpiece. `OrdersService.checkout`:
1. Reads the user's cart.
2. Rejects if empty.
3. Re-fetches each cart item's listing fresh (not the cart's possibly-stale joined copy) and rejects the *whole* checkout if any listing has been deactivated since it was carted - see the comment in `orders.service.ts` for why "reject all" was chosen over "drop the stale item."
4. Snapshots each line's `unitPriceCents` at the *current* listing price - not whatever price the cart happened to cache.
5. Delegates the actual write to `OrdersRepository.checkout`, which wraps order creation + order-item creation + cart-clearing in a single `prisma.$transaction` - so a crash mid-checkout can't leave an order without its items, or a cleared cart without an order.

**Endpoints:**
- `POST /orders/checkout`
- `GET /orders` - paginated order history
- `GET /orders/:id` - single order, scoped to the requesting user (returns 404, not 403, for someone else's order - doesn't confirm the order exists to a non-owner)

See `tests/orders.service.test.ts` - in particular the "stale price" and "deactivated listing" tests, which are the two race conditions this module exists to guard against.
