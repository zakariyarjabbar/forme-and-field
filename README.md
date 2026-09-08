# FORME & FIELD

A complete local portfolio demonstration for a fictional furniture and lighting studio. An editorial storefront, 24-piece catalog, shoppable rooms and a working customer-to-merchant commerce flow, built with Next.js and SQLite.

**No real products are sold or shipped. No real payment or external email is sent.** The brand, product names, specifications and images are creative concepts; no commercial results or trademark clearance are claimed.

![FORME & FIELD](public/images/social/home.jpg)

[Mobile storefront](docs/qa/home-mobile-viewport.png) · [Product page](docs/qa/product-desktop.png) · [Merchant view](docs/qa/admin-desktop.png) · [Full visual evidence](docs/qa/visual-results.json)

## Run locally

Verified environment: macOS, Node **26.0.0**, npm **11.12.1**, Chrome **152**. Package engine requires Node **22.13.0 or later**; other supported Node versions have not been separately exercised. Native `better-sqlite3` binaries may require platform build tools when a prebuilt binary is unavailable.

```sh
git clone https://github.com/zakariyarjabbar/forme-and-field.git
cd forme-and-field
npm ci
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No payment, email or other provider credentials are needed. All selected images and fonts are stored in the project. There is no dependency on the temporary generation folder to run the store.

To run the production build, stop the development server first:

```sh
npm run build
npm run start
```

The data file defaults to `data/forme-field.sqlite`. The default `.env.example` values work locally; when changing origins or ports, update `NEXT_PUBLIC_SITE_URL` accordingly because configured origins are enforced by the mutation endpoint. Scripts read exported environment values and otherwise use the same default database path; export `DATABASE_PATH` when running database commands against a custom database.

## Walk through the demo

1. Open [/demo](http://localhost:3000/demo) and choose **Enter demo account**. This creates a private demonstration workspace and sample profile. Guest shopping also works without entering first.
2. Browse [/shop](http://localhost:3000/shop), filter by category/material/availability/price, select a finish, save a piece or add it to your bag. Filters and sorting survive refresh and sharing through the URL.
3. Explore one of three [/rooms](http://localhost:3000/rooms). Review the pieces, quantities, finishes, availability and subtotal before adding a room.
4. In checkout, use fictional delivery details. Choose **Declined payment** to test recovery, or **Successful payment** and **Place demo order** to create a persisted order. The form never requests card details.
5. Inspect the confirmation and [/account](http://localhost:3000/account) order history. Open [/admin](http://localhost:3000/admin) in the same browser to see that order from the merchant view.
6. Move an order through paid → processing → shipped → delivered. Cancel paid/processing orders to restore stock once and record a simulated refund. The customer order page reflects the updates.
7. Edit catalog products and variant prices/stock, archive or restore products, create a product using the asset-library picker, submit a contact inquiry and inspect its record and acknowledgment in the merchant outbox.
8. Use **Reset my demo workspace** on `/demo` and confirm to restore your own starting catalog and clear demo records. Other visitors are unaffected.

Sessions expire after seven days. This is a server-recognized demonstration identity, **not production customer authentication**. A second browser context receives an independent catalog and inventory; it cannot read or alter the first visitor's orders.

## Implemented scope

- Editorial homepage, 24 products, three collections, three shoppable rooms, three complete journal articles, studio and information pages.
- Relevant imagery for every product; primary, alternate and detail views for six featured pieces; local provenance register and source atlases.
- URL search/filter/sort, finish selection, accessible gallery zoom, wishlist, cart drawer, persistent cart and wishlist, availability and empty/error states.
- Guest demo checkout, standard/white-glove delivery, explicit tax assumption, success/decline simulation, order snapshots, idempotent retries, atomic inventory changes and cancellation/refund simulation.
- Isolated account, addresses, protected orders, merchant catalog/inventory/orders/inquiries/outbox/activity. All important ownership checks happen server-side.
- Validated contact form with deduplication and local acknowledgment. No newsletter form is displayed.
- Responsive layouts, keyboard-accessible dialogs, focus states, reduced-motion support, local variable fonts, Next Image optimization, route metadata, favicon and social preview. Fictional offers are noindex by default.

## Commands and verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
# With the local production or development server running:
npm run test:e2e
```

Playwright is configured for an installed Chrome browser. It uses independent test contexts and only mutates their own demo workspaces. If Chrome is unavailable, install it or adjust the Playwright channel and install its matching Chromium runtime. `TEST_BASE_URL` selects a different local preview origin.

Additional reproducible evidence:

```sh
npx tsx scripts/visual-qa.ts
npx tsx scripts/accessibility-qa.ts
node scripts/performance.mjs
npx tsx scripts/prepare-assets.ts
```

Final results: **19 focused tests, 8 end-to-end tests, typecheck, lint and production build passed.** Mobile Lighthouse Performance measured **94** on the homepage and product page, with zero measured layout shift.

See [QA](docs/QA.md) for actual results, measurements, prior failures, viewport captures and the limits of automated checks. Unit/invariant tests use a temporary database and include two competing processes. Lint excludes generated Playwright and Lighthouse reports, while all application and authored test source remains checked.

## Persistence and providers

`npm run db:migrate` applies the idempotent initial schema and seed. `npm run db:seed` verifies the deterministic baseline while preserving existing visitor edits. `npm run db:cleanup` deletes expired workspaces. For a personal reset, use `/demo`; there is intentionally no unconfirmed global reset command.

USD money uses integer cents. Standard delivery is $75 below a $1,500 merchandise subtotal and free at/above it. White glove delivery is a $150 alternative total fee. For this fictional scenario, displayed prices include any applicable demo tax and no additional tax is added; this is not verified tax guidance.

| Integration | State |
| --- | --- |
| Built-in payment simulator | Implemented and exercised; no real money |
| Local message outbox | Implemented and exercised; no delivery |
| Stripe test-mode adapter | Unimplemented; not required for the default demo |
| External email delivery | Unconfigured |
| Public hosting | Not deployed |

For a hosted demonstration, use a Node service with a persistent SQLite volume, HTTPS, `COOKIE_SECURE=true`, a configured canonical origin, backups and periodic cleanup. Ephemeral serverless storage is unsuitable. A hosted database alternative requires adapting and verifying the transactional data-access layer. Production commerce would additionally require real authentication, operational security, provider-specific payments/shipping and merchant-specific legal/tax rules.

## Design and asset notes

The visual system combines Newsreader and Manrope, warm chalk, olive charcoal and restrained oxblood actions. Original generated imagery is reference-conditioned to preserve the main product silhouettes. All source prompts and product associations are recorded in [ASSETS](docs/ASSETS.md); font OFL licenses and selected source PNGs are retained.

The native product panels are **512×512**. They work at the catalog's display sizes, but enlarged gallery views cannot reveal additional real detail. Exact images for secondary finishes are absent and explicitly represented by labelled colour swatches. Room scenes are 1536×1024. No invented customer evidence, manufacturing claims or certifications appear in the site.

## Project map

[Product scope](PRODUCT.md) · [Design system](DESIGN.md) · [Architecture](docs/ARCHITECTURE.md) · [QA evidence](docs/QA.md) · [Current status](docs/STATUS.md) · [Asset register](docs/ASSETS.md) · [Case-study draft](docs/CASE_STUDY.md) · [Approved full brief](docs/BRIEF.md)

## Link previews

Open Graph and large-image Twitter Cards provide a branded 1200×630 JPEG for the homepage, all 24 seeded products, three rooms and three journal articles. Photo cards are local static assets: crawlers do not need JavaScript, a login or an image-generation service. Public metadata is resolved from the visitor's authorized context; anonymous crawlers receive the baseline catalog. Private merchant-created pieces fall back to the brand card.

Regenerate with `npx tsx scripts/social-assets.ts`. Verify a running preview with `npx tsx scripts/verify-social.ts`.

For real chat previews, deploy the Node application with durable SQLite storage and set `NEXT_PUBLIC_SITE_URL` to its actual public HTTPS origin before building. Localhost links cannot be fetched by external chat crawlers. Search indexing remains disabled; named preview crawlers may fetch public pages and images, while private routes remain excluded. A chat platform may cache an older preview or choose a different layout; Instagram does not expose the same preview UI in every surface. End-to-end previews in external chat apps have not been tested.

The GitHub repository is public at [zakariyarjabbar/forme-and-field](https://github.com/zakariyarjabbar/forme-and-field). GitHub controls the preview for its own repository URL separately from this website's metadata. To customize that preview, use repository Settings → Social preview → Upload an image, selecting `public/images/social/home.jpg` ([GitHub instructions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)). The website itself is not deployed by pushing this repository; GitHub Pages cannot run its Node/SQLite commerce backend.
