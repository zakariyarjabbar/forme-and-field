# FORME & FIELD

An editorial furniture and lighting portfolio demo with 24 products, three shoppable rooms, three journal articles, simulated checkout and a merchant dashboard. **All shopping and merchant data stays in the visitor's browser. No database or provider account is required.**

![FORME & FIELD](public/images/social/home.jpg)

No real products are sold or shipped. No payment or external email is sent. Product specifications and imagery are fictional design concepts.

## Run

Use Node 22.13+ and npm. The current local checks use Node 26.0.0.

```sh
git clone https://github.com/zakariyarjabbar/forme-and-field.git
cd forme-and-field
npm ci
npm run dev
```

The repository is private; GitHub access is required. Open [localhost:3000](http://localhost:3000). Production:

```sh
npm run build
npm run start
```

No database migrations, seed command, native database binaries or secrets are needed. The bundled catalog seeds each browser automatically. `node_modules`, build output, environment files and old local database files remain excluded from Git.

## Deploy on Vercel

Import the private repository with the Next.js framework preset. Install with `npm ci`; build with `npm run build`. Keep the default output setting. The server does not write a database or create a `data` directory.

Remove obsolete `DATABASE_PATH` and `COOKIE_SECURE` settings. Set `NEXT_PUBLIC_SITE_URL=https://forme-and-field.vercel.app` for that production domain, or leave it unset to use Vercel's production URL automatically. Do not retain `http://localhost:3000` as the public URL in Vercel. Redeploy after environment changes. No Supabase, Neon or other storage integration is needed.

The website is a browser-local simulation. It cannot receive real orders or inquiries from other visitors. Preview domains and the production domain have independent browser storage.

## Explore the demo

1. Shop, filter and save pieces. Bag and wishlist survive refreshes in this browser.
2. Open `/demo` and choose **Enter demo account** to expose customer and merchant views.
3. Use fictional delivery details at checkout. Try a decline, then a success. The order, address, stock adjustment and confirmation preview are saved locally.
4. Open `/account` for orders and addresses, or `/admin` for product creation/editing, inventory, order transitions, inquiries, outbox and activity.
5. Submit a demo contact inquiry and inspect it in your local merchant view. Nothing is sent externally.
6. Open another tab on the same domain to see synchronized changes. Another browser/profile starts with an independent demo.
7. Confirm **Reset my demo workspace** to restore the catalog and clear this browser's records.

## Storage behavior

The app saves one versioned `localStorage` record. There is no server database, login or seven-day expiration. Data remains until reset, site-data clearing or browser eviction. Private browsing may clear it on exit. Anyone using this browser profile can view or edit its local demo. There is no cross-device sync or cloud backup.

Web Locks serialize edits across tabs. Current browsers on HTTPS or localhost are required for mutations. If storage is blocked/full, the app reports that saving failed; it does not claim an order was stored. Malformed saved data stays untouched until an explicit reset. Prices and inventory are checked for simulation consistency but are browser-editable, not secure business records.

## Verify

Run the production server before browser checks:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npx tsx scripts/verify-social.ts
```

Playwright uses an installed Chrome browser. `TEST_BASE_URL` overrides localhost. Additional bounded checks: `npx tsx scripts/visual-qa.ts`, `npx tsx scripts/accessibility-qa.ts`, `node scripts/performance.mjs`. Current evidence and historical database-era results are distinguished in [QA](docs/QA.md).

## Link previews and assets

31 branded 1200×630 JPEG cards cover the homepage, 24 products, three rooms and three articles. Public seed metadata renders before JavaScript for chat crawlers. The hosted website's URL is needed for external previews; localhost cannot be fetched by a chat platform. Local catalog edits and custom products are not uploaded to the public preview metadata. Regenerate cards with `npx tsx scripts/social-assets.ts`.

Newsreader/Manrope and all images are local. Source prompts, associations and font licenses are retained in [ASSETS](docs/ASSETS.md). Product panels are natively 512×512, so zoom does not add detail. Secondary finishes use explicit swatches when exact photography is unavailable.

[Desktop](docs/qa/home-desktop.png) · [Mobile](docs/qa/home-mobile.png) · [Product](docs/qa/product-desktop.png) · [Merchant view](docs/qa/admin-desktop.png)

[Product](PRODUCT.md) · [Design](DESIGN.md) · [Architecture](docs/ARCHITECTURE.md) · [QA](docs/QA.md) · [Status](docs/STATUS.md) · [Case study](docs/CASE_STUDY.md) · [Original brief and override](docs/BRIEF.md)
