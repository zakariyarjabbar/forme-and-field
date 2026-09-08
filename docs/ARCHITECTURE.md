# Architecture

## Runtime and feature boundaries
Next.js 16.3.4 App Router and React 19.2.8 render content/data in Server Components. Small client components own dialogs, selections and forms. CSS uses shared semantic variables. Every database-backed route uses Node. SQLite (`better-sqlite3`) is accessed through Drizzle schemas and the small service layer in `lib/server/store.ts`; no database API is exposed to the client.

- `lib/content`: deterministic 24-product catalog, collections, three rooms and three complete journal articles; informational content.
- `lib/db`: Drizzle table definitions, SQLite connection, numbered SQL migrations.
- `lib/server`: session resolution, catalog/cart/order/account/admin services and simulated payment boundary.
- `lib/money.ts`: shared integer-cent pricing rules, including delivery boundaries.
- `lib/validation.ts`: Zod schemas for untrusted mutations.
- `app/api/demo`: one discriminated mutation endpoint. It validates input, verifies same-origin JSON requests, resolves the HttpOnly session and chooses a server service. It ignores unknown client properties such as workspace IDs, roles and trusted payment statuses.
- `app/api/state`: private, no-store shopping state.
- `components`: focused UI components; routes fetch current workspace data on the server.

Next's installed version-matched server/client, image and route-handler guides were read before implementation. External reference pages: [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Images](https://nextjs.org/docs/app/getting-started/images), [Drizzle SQLite](https://orm.drizzle.team/docs/sqlite/get-started-sqlite).

## Relational data and migration
`workspaces` owns `sessions`, `products`, `variants`, `cart_items`, `wishlist`, `addresses`, `orders`, `order_items`, `payments`, `inquiries`, `outbox`, and `activity`. Product editorial fields and immutable order line snapshots use typed JSON columns. Categories/collections, asset associations, rooms and journal content are typed local content. Newsletter subscriptions are absent because the UI does not display a newsletter form.

Compound workspace keys and foreign keys preserve product/variant/cart/order associations. Constraints reject negative prices/stock, invalid quantities, invalid order statuses and inconsistent totals. Foreign-key cascades implement a scoped workspace cleanup. Payment `(workspace,key)` and inquiry `(workspace,fingerprint)` unique constraints enforce deduplication.

SQLite enables WAL, foreign keys and a 5-second busy timeout. The initial migration uses `CREATE IF NOT EXISTS` and a migrations register; startup and `db:migrate` are safe to rerun. `db:seed` inserts missing baseline records without resetting existing visitor edits. Migration two removes the upper database stock ceiling so cancellation can restore stock after a merchant replenishes inventory up to the input limit. It preserves existing rows and their foreign-key relationships in one transaction. Future schema changes should be added as explicit numbered migrations, not edits that pretend an existing table was migrated.

The runtime database path is deliberately excluded from static output-file tracing because it is a mutable external data file. `lib/db/migration.sql` and `lib/db/migration-002.sql` remain part of application source and must be included with any manual server package.

## Demo identity and ownership
The first cart/wishlist/contact action, or explicit demo entry, creates a workspace with a cloned catalog. Browsing without a workspace uses a read-only baseline catalog. Each identity uses a cryptographically random 256-bit session token; only its SHA-256 hash is stored. The cookie is HttpOnly, SameSite=Lax, path `/`, with a seven-day lifetime. `COOKIE_SECURE=true` is required for HTTPS deployments; the local HTTP preview uses false. Session credentials are never passed into client props.

`Enter demo account` enables the customer/merchant views for the same workspace. It is intentionally a demonstration identity rather than production authentication. Merchant access requires the server's `entered` flag, not a submitted role or a hidden link. Every order read or mutation, inquiry update, address update and product mutation scopes queries to the session's workspace. A client cannot choose a workspace. Unknown private object URLs show the not-found state. Personalized content is rendered on demand with no shared user cache.

Expiration is absolute after seven days. Expired credentials are rejected before access; new workspace creation and `npm run db:cleanup` delete expired workspaces. A reset requires the explicit `RESET` confirmation payload and operates inside one transaction on the current workspace. It restores the starting catalog/profile and clears commerce records; other visitors are untouched. It retains the opaque session but requires demo entry again.

## Cart and checkout invariants
Cart lines reference real variants, merge identical variants, allow 1–20 units and preserve an unavailable line for explicit correction. Prices and stock are always read from the server catalog. The API never accepts a line-item price as authoritative. The client sends an expected final total only to detect a price change and require review.

Money is stored in integer cents. Standard delivery is 7500 cents below a 150000-cent merchandise subtotal and zero at or above it. White glove delivery is an alternative 15000-cent total delivery fee. No promotions or currency conversion. Additional tax is zero because the fictional scenario assumes displayed prices include applicable demo tax; this is not tax guidance.

The synchronous simulator decision, order insert, immutable line snapshots, conditional stock deductions, payment attempt, cart clear, address save, outbox message and activity entry occur in one `BEGIN IMMEDIATE` transaction. Declines persist only the declined attempt/activity; they never decrement stock or create a paid order. Conditional updates and SQLite write serialization prevent overselling. A matching repeated idempotency key returns the recorded result. Reusing a key with a different payload is rejected.

Paid → processing → shipped → delivered are the normal transitions. Paid/processing → cancelled is allowed for customers and merchants. Cancellation restores quantities once and records `simulated-refunded`; repeated cancellation is idempotent. Completed order line names, SKUs, variants and prices are snapshots, so catalog changes do not rewrite order history.

## Providers and messages
`lib/server/payments.ts` is the synchronous simulated provider. External Stripe test mode is **unimplemented** and no external payment credentials are required or loaded. A real asynchronous adapter needs stock reservations, expiry/release, signed webhook verification, idempotent webhook completion and provider-specific refunds. A redirect must never mark an order paid.

Order confirmations and contact acknowledgments are persisted in the workspace outbox. They are readable previews, with no external delivery. Contact form duplicates return the original inquiry and do not duplicate acknowledgments. All merchant mutations leave activity where relevant. Product images are chosen from a local catalog asset picker; arbitrary uploads/remote URLs are rejected.

## Caching, assets and deployment
`cookies()` opts personalized pages into request-time rendering. Mutation responses contain fresh shopping state and trigger `router.refresh()` for Server Components. Assets and font files are local and immutable application files; Next Image serves responsive formats and reserves image dimensions. Hero imagery is eagerly requested with high fetch priority; below-the-fold imagery loads lazily. Next Font preloads the Latin Newsreader weight-only normal/italic files and Manrope, with adjusted fallbacks. There is no root loading boundary that temporarily renders the footer ahead of route content; filter changes and mutations expose their own pending states without replacing the page layout. Fictional storefront pages default to noindex/nofollow and robots disallows general crawling while explicitly allowing named chat-preview crawlers on public paths. Private paths remain excluded. Open Graph and large-image Twitter metadata point to static 1200×630 JPEG cards in public/images/social.

A production demonstration deployment would run as a Node service behind HTTPS with a durable SQLite volume, writable by the application, backups and a scheduled cleanup job. A single writer service is the simplest operational shape. Do not deploy the database onto an ephemeral serverless filesystem. A hosted relational database requires a compatible data-access adapter and transaction verification. The user requested a private GitHub repository at https://github.com/zakariyarjabbar/forme-and-field. Website hosting remains unconfigured.

This is not an externally audited authentication/security system. Public exposure would additionally need deployment-specific traffic limits, abuse controls, monitoring and retention configuration. It does not provide real customer authentication, actual shipping, email, or real-money commerce.
