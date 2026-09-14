# Cart module

Built end-to-end: `cart.repository.ts` -> `cart.service.ts` -> `cart.controller.ts` -> `cart.routes.ts`, same shape as `auth` and `listings`.

**Endpoints** (all require auth):
- `GET /cart` - items joined with listing details, with computed line totals and a cart total
- `POST /cart/items` - `{ listingId, quantity? }`; upserts on the `(userId, listingId)` unique constraint, so adding an already-carted listing increments its quantity instead of duplicating a row
- `PATCH /cart/items/:id` - update quantity; deletes the row if quantity <= 0
- `DELETE /cart/items/:id`

**Business rules enforced in `CartService`, not the controller:**
- Rejects adding an inactive listing, or a listing the user themselves is selling.
- Cart totals are always computed from the listing's *current* price on read - the snapshot-at-purchase-time behavior only happens at checkout (see `orders/`), which is deliberate: a cart is a live view, an order is a receipt.

See `tests/cart.service.test.ts` for the covered cases.
