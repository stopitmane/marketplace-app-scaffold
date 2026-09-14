# Marketplace App (mobile client)

React Native + TypeScript client for `marketplace-backend`. Same MVVM/Clean-ish layering as the finance app (Project #1) - build every new feature by copying the `Listings` or `Cart` slice's shape, not inventing a new one.

## Architecture

```
src/
├── core/
│   ├── di/            # Container - all wiring happens once, in App.tsx
│   ├── errors/         # AppError - deliberately mirrors marketplace-backend's AppError types,
│   │                    one error vocabulary across both repos, not two to keep in sync by hand
│   ├── types/          # Result<T,E>
│   ├── logger/
│   └── analytics/      # Self-rolled event logger - see analytics/Analytics.ts for the backend gap it assumes
├── data/
│   ├── local/          # TokenStorage (SecureStore), ListingsCache (AsyncStorage, offline fallback only)
│   ├── network/        # ApiClient - retry/backoff + coalesced auto-refresh-on-401
│   └── repositories/    # One per backend module: auth, listings, cart, orders, + local-only favourites
├── domain/
│   ├── models/          # Listing, Cart, Order, User - no persistence/sync fields
│   └── usecases/         # LoginUseCase, BrowseListingsUseCase, AddToCartUseCase, CheckoutUseCase
├── navigation/           # Deep link config (linking.ts)
├── notifications/        # Expo push notifications - structural stub
└── presentation/
    ├── screens/           # ListingsScreen, CartScreen built; ListingDetail/Checkout/Orders/Login follow the same shape
    ├── viewmodels/         # useListingsViewModel, useCartViewModel
    └── components/         # States (Loading/Empty/Error/OfflineBanner), ListingCard, CachedImage, useTheme
```

## What's genuinely worth pointing at in an interview

- **`ApiClient`'s auth refresh**: a 401 triggers exactly one refresh-and-retry, never a loop, and concurrent 401s across several in-flight requests are coalesced into a single refresh call (`refreshInFlight`) rather than each firing its own. See `data/network/ApiClient.ts`.
- **`ListingsRepository`'s offline fallback** (`data/repositories/ListingsRepository.ts`): only the plain, unfiltered first page gets cached and falls back to cache on a network error - a failed *search* returns a real error instead of silently swapping in unrelated cached listings. `__tests__/ListingsRepository.test.ts` is where this behavior is actually pinned down with tests, which is the more defensible artifact than the code alone.
- **One error vocabulary end to end**: `core/errors/AppError.ts`'s `type` values are a deliberate mirror of the backend's, so `{ error: { type: 'conflict' } }` from the API maps straight across into the same switch statement `ErrorState` already uses - no translation layer needed between the two repos.
- **Cart has no local cache, on purpose** - unlike listings, a stale local cart risks checking out against quantities/prices that no longer match the server. `CartRepository`'s doc comment explains the asymmetry.

## Deliberate scope gaps (documented, not accidental)

- **Favourites are local-only** (`data/repositories/FavouritesRepository.ts`) - `marketplace-backend` has no `/favourites` endpoint. This kept the backend's scope to its core "mobile → API → database → auth" literacy goal. Extending it to sync cross-device is a small, well-scoped addition (a `FavouriteListing` Prisma model + a module mirroring `cart`'s shape) if you want it later.
- **Analytics** (`core/analytics/Analytics.ts`) assumes a `POST /events` endpoint on the backend that doesn't exist yet - the client side is ready, the backend addition is one Prisma model + one route.
- **Push notifications** (`notifications/PushNotifications.ts`) is a structural stub - there's no server-side trigger worth notifying about yet (e.g. "order confirmed"); wire it up once `OrdersService.checkout` has something to push about.
- **`CachedImage`** starts on React Native's built-in `<Image>` caching rather than pulling in FastImage/expo-image immediately - swap it once you're profiling an actual scroll-performance problem on a real listings feed, not before. One file to change either way.

## Running locally

```bash
cp .env.example .env      # point EXPO_PUBLIC_API_URL at your running marketplace-backend
npm install
npm run typecheck
npm run lint
npm test
npm start
```

Needs `marketplace-backend` running locally (see its own README) - this client has no offline-only mode beyond the listings cache fallback described above.
