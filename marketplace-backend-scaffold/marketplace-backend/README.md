# Marketplace Backend

A small, real backend (Node/Express + PostgreSQL via Prisma) built for backend literacy: mobile → API → database → auth → response → mobile state, end to end, not a black-box BaaS.

## Architecture

```
src/
├── core/
│   ├── errors/AppError.ts      # Typed errors + statusForErrorType mapping
│   ├── logger/Logger.ts         # Structured JSON logging
│   └── middleware/
│       ├── errorHandler.ts      # Central place AppError -> HTTP response
│       ├── auth.ts              # JWT verification, sets req.userId
│       └── requestId.ts         # Correlation id for log grepping
├── modules/
│   ├── auth/          # repository -> service -> controller -> routes (fully built - the template)
│   ├── listings/       # same shape, second worked example (search/filter/pagination)
│   ├── cart/           # built - upsert-on-add, business rules in the service (see cart/README.md)
│   └── orders/         # built - atomic checkout transaction, price snapshotting (see orders/README.md)
├── config/env.ts       # Fail-fast env validation at boot
├── app.ts              # Middleware order + route mounting
└── server.ts           # Entrypoint
```

**Layering, same rule as the mobile app:** controllers never touch Prisma directly; services never touch `req`/`res`; repositories never contain business rules. This is what makes `AuthService` and (once you build it) `CartService` unit-testable with a fake repository and zero real database - see `tests/auth.service.test.ts`.

## Running locally

```bash
cp .env.example .env          # fill in real secrets
docker compose up -d          # starts Postgres on :5432
npm install
npx prisma migrate dev        # creates tables from prisma/schema.prisma
npm run dev                   # http://localhost:4000, docs at /docs
```

## What's built

All four modules are built end-to-end - `auth` (register/login/refresh with bcrypt + JWT access/refresh rotation), `listings` (cursor-paginated search/filter/create), `cart` (upsert-on-add, seller/inactive-listing guards), and `orders` (atomic checkout transaction with price snapshotting and a fresh-listing re-check to guard against a cart item going stale between add-to-cart and checkout). Swagger docs at `/docs` are generated straight from JSDoc comments in each module's route file, so they can't silently drift from the code.

Not built: profiles beyond what `User` already holds, push notifications, image upload (listings take an `imageUrl` string - wiring up actual upload/storage is a separate concern from this API's core CRUD+checkout logic), and analytics. Those are mobile-client-adjacent or infra concerns better tackled once the client exists to actually need them.

## Design decisions worth defending in an interview

- **Cursor pagination, not offset** (`listings.repository.ts`): stays correct under concurrent inserts and doesn't degrade at high page numbers.
- **Refresh token rotation**: each refresh both issues new tokens and revokes the one just used, so a leaked refresh token has a single-use blast radius, not an indefinite one.
- **Price snapshotting on `OrderItem`**: historical orders keep the price at time of purchase even if the listing's price changes later - see the schema comment.
- **Error shape is typed end-to-end**: `AppError`'s `type` field is what the mobile app's own `AppError.ts` branches on to decide toast vs. retry-button vs. logout - keeping the vocabulary consistent across both repos was a deliberate choice, not a coincidence.

## Tests

`npm test` runs `tests/auth.service.test.ts` against a fake in-memory repository - no Docker, no Postgres needed for this suite. CI additionally spins up a real Postgres service container and runs Prisma migrations against it, so the moment you add integration tests that hit a real database, the pipeline is already wired for it.
