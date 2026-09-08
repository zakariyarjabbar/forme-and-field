# Architecture

## Current scope and override
The user explicitly requested browser-local data with no database on 2026-09-08 after attempting Vercel deployment. This replaces the original SQLite/server-session design. Historical commits and QA evidence describe that previous implementation; they are not current behavior.

## Boundaries
Next.js App Router and React render public editorial content from `lib/content`. Server components never open a database or write to a runtime directory. `lib/local/store.ts` is a pure, typed copy-on-write action engine shared by the browser and tests. `lib/local/actions.ts` validates action payloads. `lib/local/browser.ts` owns browser persistence and tab coordination. Small client components consume the provider. The old `lib/db`, server store/session layer, database scripts and commerce API routes were removed, along with better-sqlite3/Drizzle dependencies.

`StoreProvider` uses `useSyncExternalStore` with a stable seed snapshot on the server and during initial hydration. Subscription loads saved data; account, checkout, orders and admin wait until that finishes. Shop, cards, product details and rooms resolve local catalog edits after hydration. Public Open Graph metadata uses seed content only, so local private edits are never uploaded for sharing. Custom browser-created slugs resolve client-side; unknown product/order IDs show a useful missing state after loading. These client-only missing records have a 200 HTTP shell, not a server-side 404.

## Storage and isolation
One versioned JSON record, `forme-field:browser-demo:v1`, lives in localStorage. It contains products and variants, cart references, wishlist, orders and immutable line snapshots, profile, addresses, payment attempt outcomes, inquiries, outbox and the last 50 activity entries. It contains no image binary data, credentials or database secrets. Image references are restricted to the bundled catalog. A fresh browser starts with 24 products and 48 variants.

The boundary is the browser profile and website origin. Tabs on that origin share data; another browser, private context, device, preview subdomain or localhost origin starts independently. There is no real authentication, merchant privilege security, shared business inventory or cross-device sync. Someone with access to the browser can inspect/change its records. Do not use this for real sales or sensitive information.

No automatic seven-day expiry exists. Data persists while the browser retains site storage; reset, clearing storage, private browsing cleanup or eviction can remove it. Old server SQLite records are not automatically imported, and an obsolete session cookie has no effect. Local database files on the developer machine are left untouched and ignored by Git.

## Write lifecycle
Every mutation requests an exclusive Web Lock for the storage key, reads and validates the latest persisted snapshot inside that lock, applies an action to a clone, and saves the whole result with one localStorage setItem. Only a successful write publishes state to the UI and resolves the action. A failed validation, unavailable finish or quota error cannot partially deduct stock or report a successful order. The browser storage event synchronizes other tabs; pageshow/focus reload state after suspension. Storage clears also reset visible data in other tabs.

Web Locks are required for mutation safety across tabs; use a current browser on HTTPS or localhost. There is no unsafe unlocked write fallback. Invalid JSON/schema versions are left intact with a visible error until the user explicitly confirms reset. Blocked/full storage reports that no change was saved. A failed write never falls back to silent in-memory persistence.

Local validation improves demo reliability; it cannot make browser-owned data authoritative against deliberate modification. Saving is synchronous and bounded by the browser's quota; no guarantee of permanent storage is made.

## Commerce behavior
USD values are integer cents. Standard delivery is $75 below a $1,500 merchandise subtotal and free at/above it; white glove is an alternative $150 fee. Displayed prices include any applicable demo tax and no extra tax is added. This is fictional scenario configuration.

Cart variants merge and permit 1–20 units. Checkout derives prices/availability from the current local catalog and compares the reviewed total. A declined attempt preserves cart and stock. Success saves order snapshots, deducts local stock, stores address/outbox/activity and clears the bag together. Repeated keys with matching checkout inputs return the same result; different input reuse is rejected.

Paid → processing → shipped → delivered; paid/processing → cancelled. Cancellation restores stock once and records a simulated refund. Merchant editing cannot silently remove variants that existing records may reference. Slugs and SKUs are unique in the local catalog. Contact duplicate inputs return the original inquiry, with one acknowledgment preview. No card processor or external messaging service exists.

## Vercel and sharing
Use the normal Next.js build (`npm run build`) with no database variables or storage integration. There is no `/var/task/data` startup write. The app can render on Vercel's filesystem constraints; dynamic routes only compose seed content and client view shells.

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin for accurate social URLs. When omitted, Vercel's `VERCEL_PROJECT_PRODUCTION_URL` supplies it; localhost is the development fallback. A configured stale localhost origin must be removed or updated in the dashboard. Product/room/article Open Graph cards are static JPEG files. Named chat crawlers may fetch public pages/images; general search indexing is disabled. Noindex is an indexing preference, not authentication.

GitHub repository: private, https://github.com/zakariyarjabbar/forme-and-field. A push may trigger the user's linked Vercel deployment. Verify deployment status separately from local build/test evidence. No database account, paid service or provider secret is required.
