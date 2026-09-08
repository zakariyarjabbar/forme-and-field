# Current QA — browser-local demo

Verified 2026-09-08 on macOS, Node 26.0.0, Next.js 16.3.4 and Chrome 152.0.7977.77 against the local production build. The latest user instruction replaced SQLite and server-owned sessions with localStorage. Historical database-era results below do not describe current storage or security guarantees.

| Check | Current result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | 11 passed |
| `npm run build` | Passed; no database or runtime data-directory writes |
| `npm run test:e2e` | 11 passed in 23.9 seconds |
| `npx tsx scripts/visual-qa.ts` | 35 route/viewport combinations; zero overflow, broken images or page errors |
| `npx tsx scripts/accessibility-qa.ts` | 18 scans; zero configured WCAG-tag violations |
| `npx tsx scripts/verify-social.ts` | 16 bot/route checks passed; initial-head OG metadata and anonymous 1200×630 JPEG delivery |
| `npm ls better-sqlite3 drizzle-orm` | No installed database packages |

Evidence: [unit tests](qa/local-tests.txt), [browser tests](qa/local-e2e.txt), [production build](qa/local-build.txt), [typecheck](qa/local-typecheck.txt), [lint](qa/local-lint.txt), [visual results](qa/visual-results.json), [accessibility results](qa/accessibility-results.json), [social checks](qa/social-preview-results.json). Desktop/mobile screenshots in `docs/qa/` were refreshed and inspected, including homepage, account and merchant views. No design redesign was needed.

The unit suite covers independent seed snapshots, schema/JSON validation, cart quantity/stock rules, atomic room rollback, success/decline/retry behavior, immutable order lines, totals validation, archive rejection, exactly-once cancellation/restock, transition limits, unknown local records, inquiry deduplication, scoped reset and saved addresses. Browser tests exercise all existing shopping/merchant/contact flows, two independent browser contexts, simultaneous same-origin tabs, tab synchronization, fresh-page persistence, corruption/reset, quota failure without false success, and absence of commerce API/POST requests.

During migration, stale generated Next route types referenced the removed APIs; they were regenerated. Two initial browser assertions matched both thumbnail and text links and were narrowed. A polling assertion read before the asynchronous tab write completed; it now waits for the persisted quantity. Final suites pass with the ordinary checks enabled. The filesystem cleanup command was automatically rejected; stale generated type directories were safely moved aside and regenerated.

Current limitations: data is local and editable, not authenticated or authoritative. It is not shared across devices/origins and can be removed by site-data clearing or eviction. Web Locks require a supported browser on HTTPS/localhost; mutation failure is explicit when unavailable. Server-only order/product missing states now use a client-resolved missing view inside a 200 page shell. Chrome was verified; other browser engines and screen-reader speech were not. Automated axe results are not a WCAG certification. Lighthouse was not rerun for this storage migration; older measurements below remain historical. Vercel deployment must be verified separately from these local results.

---

# Historical QA — earlier SQLite implementation

# QA and verification

Verified on **2026-09-08**, using macOS, Node 26.0.0, npm 11.12.1, Next.js 16.3.4 and headless Chrome 152.0.7977.77. Browser checks ran against the local **production build** at `http://localhost:3000`. Screenshots show actual records created in a separate QA workspace, not invented business results.

## Command results

| Command | Final result |
| --- | --- |
| `npm run typecheck` | Passed; strict TypeScript |
| `npm run lint` | Passed; application and authored tests checked |
| `npm test` | **19 passed**; temporary SQLite database |
| `npm run build` | Passed; no final build warnings |
| `npm run test:e2e` | **8 passed** in 23.3 seconds on the final build |
| `npm run db:migrate` | Passed; schema version 2 |
| `npm run db:seed` | Passed repeatedly; workspace edits preserved |
| `npm audit --json` | **0 known reported vulnerabilities** at verification time |
| `npx tsx scripts/visual-qa.ts` | 35 route/viewport combinations; 0 horizontal overflows, 0 broken images, 0 page errors |
| `npx tsx scripts/accessibility-qa.ts` | 18 scans across 9 routes and 2 widths; 0 violations under the configured WCAG tags |
| Impeccable mechanical detector | Ran once on `app` and `components`; returned an empty finding list |
| `node scripts/performance.mjs` | Mobile Lighthouse Performance **94** homepage, **94** product page |

Generated Playwright/Lighthouse reports are excluded from source lint because they include third-party minified JavaScript. No application type, lint, build or test check was disabled. A development-only migration generator with four vulnerable transitive dependency reports was removed; the actual numbered SQL migration runner remains implemented and tested.

## Focused invariant coverage

The 19 tests exercise integer-cent arithmetic and exact delivery boundaries; invalid money/quantities/addresses; deterministic reseeding; cart merging and visitor separation; successful and declined payments; idempotent success/decline retries; different payload reuse of an idempotency key; tampered totals; archived-product checkout rejection; immutable order snapshots; permitted transitions; exactly-once cancellation/restocking/refund; cancellation after a merchant replenishes to the input ceiling; protected order/inquiry/address reads and mutations; inquiry deduplication; scoped reset; atomic room add rollback; invalid variants/assets; opaque tokens and expiry; malformed/repeated URL parameters; and same-origin request verification.

The stock competition scenario uses **two independent Node processes/SQLite connections** attempting checkout in the same workspace. One paid order is created, the competing attempt is rejected and stock reaches zero without going negative. Foreign-key integrity is checked after the stock-restoration edge case.

## Browser journeys

The eight end-to-end tests cover the ten scenarios in the approved brief:

1. Filter/search/sort using the URL; open Cove; select unavailable and available finishes; save; add to bag; change quantity.
2. Reload and verify bag and wishlist persistence.
3. Submit invalid checkout details, focus the erroneous field, correct errors and retain valid entered values.
4. Complete a simulated purchase; verify total, protected confirmation, account history, stock and local outbox.
5. Trigger a decline; verify useful feedback, unchanged stock, retained cart and address fields, then recover to success.
6. Submit the same checkout concurrently; verify one recorded order, the same returned order ID and no duplicate deduction.
7. Inspect the order in its merchant workspace, simulate a permitted processing transition and verify the customer view reflects it.
8. Use two independent visitor contexts; verify protected object URLs and mutations cannot cross workspaces. Reset one and preserve the other.
9. Submit and deduplicate a contact inquiry, resolve/reopen it in admin and inspect its acknowledgment preview.
10. Use mobile apply/reset filters, keyboard Enter/Escape, focus restoration, room selection and shopping routes without horizontal overflow.

Additional browser coverage creates, edits, archives and restores a catalog product, confirms live storefront price/stock changes, checks all requested public route families and invalid slugs, and verifies all homepage images load. No real card details, external emails or live payments were used.

## Visual and accessibility evidence

The final visual script checked homepage, catalog, product, cart, checkout, account and admin at **360×800, 390×844, 768×1024, 1024×900 and 1440×1000**. It waited for fonts and image decoding before captures. Initial offscreen blank areas were identified as lazy images that had not been decoded in the first capture, not shipped missing assets. Final image checks found no missing image slots.

Full desktop/mobile images are in `docs/qa/`:

| Surface | Desktop | Mobile |
| --- | --- | --- |
| Homepage | [Capture](qa/home-desktop.png) | [Capture](qa/home-mobile.png) |
| Catalog | [Capture](qa/catalog-desktop.png) | [Capture](qa/catalog-mobile.png) |
| Product | [Capture](qa/product-desktop.png) | [Capture](qa/product-mobile.png) |
| Cart | [Capture](qa/cart-desktop.png) | [Capture](qa/cart-mobile.png) |
| Checkout | [Capture](qa/checkout-desktop.png) | [Capture](qa/checkout-mobile.png) |
| Account | [Capture](qa/account-desktop.png) | [Capture](qa/account-mobile.png) |
| Admin | [Capture](qa/admin-desktop.png) | [Capture](qa/admin-mobile.png) |

[Viewport results and browser errors](qa/visual-results.json) · [Accessibility scan details](qa/accessibility-results.json) · [Order detail](qa/order-desktop.png)

Axe scans used `wcag2a`, `wcag2aa`, `wcag21aa`, and `wcag22aa`. There were no final violations in 18 scans across homepage, shop, product, cart, checkout, contact, account, admin and a shoppable room at 1440 and 390px. Keyboard dialog activation/Escape/focus restoration were exercised. Main text contrast was verified through automated scanning; the secondary text token was darkened to #5F5D55. These results are **not an independent WCAG conformance audit**, and screen-reader speech output and other browser engines were not separately audited.

## Performance measurements

Lighthouse **13.4.1**, local production server, Chrome 152, mobile emulation **412×823**, device scale factor 1.75, simulated throttling with **150ms RTT, 1638.4 Kbps throughput and 4× CPU slowdown**. The two final routes were measured sequentially without concurrent browser test jobs. These are one-run laboratory results, not real-user Core Web Vitals or a guarantee of performance on a deployed host.

| Route | Performance | Accessibility | Best practices | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | **94** | 100 | 100 | 0.9s | 3.1s | 10ms | **0** |
| `/products/cove-lounge-chair` | **94** | 100 | 100 | 0.8s | 3.2s | 10ms | **0** |

[Homepage Lighthouse report](qa/lighthouse-home.html) · [Product Lighthouse report](qa/lighthouse-product.html) · [Machine-readable final summary](qa/performance-summary.json)

SEO scores are 66 and 69 because this fictional portfolio store deliberately blocks indexing. That policy is retained. LCP remains above 2.5 seconds under the simulated mobile conditions; the 90+ overall performance target is met, but that does not imply good real-user LCP everywhere.

The first measured scores were **59/63**, with CLS 0.376 on both routes. The root loading boundary initially painted the footer before the page, moving it when content arrived. Removing that premature fallback, using local font preloads/adjusted fallbacks and lighter Latin font files, and explicitly prioritizing the real LCP images removed measured layout shift. Initial JSON reports are retained alongside final reports.

## Findings corrected during verification

- Production origin verification incorrectly compared a public origin to the internal `0.0.0.0` bind URL. It now validates the public Host and, when configured, canonical origin. A regression test covers CSRF rejection and valid local requests.
- Generic swatch spans used an unsupported ARIA label; they now have the correct image role. The quantity output has proper semantics, and the hero's accessible name contains its visible link text.
- Footer secondary text did not meet contrast on its surface. The semantic secondary token was darkened.
- The mobile purchase bar could cover the product heading before the main purchase controls were reached. It now appears only after those controls have scrolled above the viewport, with space reserved for focus/end content.
- A populated account table overflowed at 360px. The account grid now permits the table container to shrink and scroll internally.
- The original stock constraint prevented cancellation after an operator replenished to its maximum input value. Numbered migration two preserves existing data while allowing correct stock restoration; the edge case is tested.
- The browser test's first checkout error selector also matched Next's route announcer; it was scoped to main content. Search test input was made specific because the substring “Cove” correctly also matched “alcove” in a cabinet description.
- Early test runs encountered a stopped local server. Final tests run against a retained production server and pass.

## Remaining limitations and unrun checks

- Product image panels are natively 512×512. They are relevant final concept imagery, but zoom cannot reveal extra detail. Alternate material finishes have explicit swatches instead of exact photography.
- Stripe test mode is unimplemented; external email is unconfigured; there is no public deployment. The default simulator and local outbox are fully exercised.
- Only Chrome was browser-tested. Safari, Firefox, assistive-technology speech, real devices and a public host were not separately tested.
- This demo uses a seven-day identity system, not production authentication, and has no external security audit. Deployment needs durable storage, HTTPS, appropriate operational controls and cleanup scheduling.
- No known failing required local workflow remains in the final verification results.

## Social-preview and repository follow-up — 2026-09-08

The social-card update adds 31 photo-led 1200×630 JPEG layouts, full Open Graph/Twitter large-image metadata, route-specific product/room/article cards and named preview-crawler exceptions. Home and Cove cards were visually inspected at native output size; source furniture photography is unchanged.

Verification rerun: `npm run typecheck`, `npm run lint`, `npm test` (19 passed), `npm run build`, and `npm run test:e2e` (8 passed). `npx tsx scripts/verify-social.ts` passed 16 combinations across Discordbot, facebookexternalhit, Twitterbot and WhatsApp on home, product, room and article routes. It verifies metadata in the initial HTML head, JPEG response type, anonymous image access, 1200×630 dimensions, image size below 1 MB and the retained no-index policy. Results: [social preview checks](qa/social-preview-results.json). The first asset-render attempt used an incorrect image object accessor; it was corrected to the catalog's string-path format, and all 31 cards rendered successfully.

Lighthouse was not rerun for this metadata/static-card update; the earlier performance measurements remain historical evidence. External Discord/Instagram unfurling is untested because the website has no public deployment. GitHub repository publication does not publish this Node/SQLite website. GitHub's own repository preview image is a separate browser setting and has not been uploaded.

Before the first push, staged files were checked for environment/database/build directories and common credential patterns. No matching sensitive files or credential patterns were found. This bounded scan is not a comprehensive external security audit.
