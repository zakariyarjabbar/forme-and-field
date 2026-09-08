# FORME & FIELD — complete project prompt for GPT-6 Astra

You are working in my project as the creative director, ecommerce UX designer, and senior Next.js engineer. Build the project described below, including its durable project instructions and documentation. Treat this as an implementation request: establish the project, make decisions, create the assets, build the website, and verify the result. Do not stop after producing a plan or README.

## A. Objective and priorities

We are a web agency creating a flagship portfolio project: a fully working premium furniture and lighting store for a fictional brand. Prospective clients should be able to browse it, complete a demonstration purchase, and explore the corresponding business dashboard.

**Design and style are the highest priority.** The storefront must demonstrate original art direction, exceptional imagery, typography, composition, and interaction design. Functional completeness is also required. A beautiful homepage attached to unfinished pages is incomplete; a technically impressive store with ordinary design is also incomplete.

Prioritize: visual identity and imagery; shopping usability; complete business workflows; responsive quality and accessibility; maintainable implementation. Security and transaction correctness are mandatory throughout. Spend more design effort on the storefront than on decorative admin features.

## B. Brand background

- Brand: **FORME & FIELD**.
- Repository/package slug: `forme-and-field`.
- Brand line: **Furniture, lighting, and the spaces between.**
- Positioning: a contemporary design studio offering sculptural, useful furniture and architectural lighting for thoughtfully composed homes.
- Audience: design-conscious homeowners, apartment owners, interior designers, and small hospitality studios.
- Personality: confident, tactile, architectural, warm, precise, and quietly expressive.
- Material vocabulary: oak, walnut, linen, wool, brushed metal, opal glass, and stone.
- Visual setting: lived-in architectural interiors, directional daylight, generous shadows, interesting negative space, and believable materials.
- Default website language: English. Default catalog currency: USD. These are editable demo assumptions, not assumptions about my agency's location.
- Brand and product names are fictional working concepts; do not claim trademark clearance, actual business registration, or domain ownership.

Write an original short brand story around proportion, materials, and everyday use. Do not invent a founding date, real founders, manufacturing facilities, sustainability certifications, press coverage, awards, reviews, or actual customers.

## C. Creative direction

The visual world is **an architectural interiors publication that also functions as an excellent store**. Aim for collectible design presented with warmth and clarity.

Use this starting palette through semantic tokens:

- Warm chalk `#F4F0E9`: main canvas.
- Deep olive charcoal `#23251F`: primary text and dark surfaces.
- Oxblood `#721F2C`: restrained signature accent and selected actions.
- Pale sage `#A6AC96`: occasional secondary surfaces.
- Warm gray `#6B6860`: secondary text, subject to contrast verification.

Start with Newsreader for expressive display typography and Manrope for body/UI typography, using properly licensed fonts. Verify actual rendering and load only necessary weights. Make the wordmark typographic, with carefully adjusted spacing and a distinctive ampersand treatment. Provide favicon and social-preview treatments.

Use an editorial grid, decisive image scale, occasional asymmetry, controlled variation in density, fine rules, and generous but purposeful space. Product tiles should read as objects arranged in a catalog, with little surrounding chrome. Border radii should be minimal and consistent.

Provide at least three memorable design moments: an exceptional opening composition, a room scene connected to purchasable products, and a product detail page with unusually good material and scale presentation.

These choices define the starting direction. Improve details with judgment while keeping one coherent identity.

## D. Visual boundaries

Avoid generic startup landing-page structures, feature-icon grids, repeated rounded containers, indiscriminate pill buttons, default component-library styling, glass panels, glowing gradients, and the automatic black-and-gold interpretation of luxury.

Do not turn every section into the same image-and-text split. Vary scale and composition while retaining a shared grid. Avoid giant empty areas without editorial purpose, tiny illegible labels, excessive all-caps copy, and decorative icons that communicate nothing.

Do not add fake scarcity, countdowns, fabricated customer counts, invented star ratings, or repeated promotional popups. Avoid scroll hijacking, custom cursors, mandatory intro animations, autoplay audio, and unnecessary 3D.

Use original compositions. You may study references for specific principles, but do not reproduce another brand's layout, copy, identity, or unlicensed assets.

## E. Imagery and asset production

Treat assets as first-class implementation work. Establish an image plan before building the full catalog: hero scenes, product images, material details, room stories, and journal photography.

Use available image-generation tools when appropriate, or verified, suitably licensed assets. If generating product variants or room scenes, use reference images to preserve object identity. Inspect the results. The same product must retain its shape, legs, proportions, upholstery, and finish across its appearances.

At launch, every product needs a relevant primary image. The six featured products need at least three useful views each: primary, alternate/context, and detail. Prepare at least three cohesive room scenes. A room's shoppable products must actually correspond to the objects pictured.

Selected variants must have accurate imagery or an explicit, useful finish representation. Do not recolor a photograph inaccurately and call it a different material. A material swatch is preferable to a false image.

Record source, license/usage basis, generation prompt where relevant, product associations, and alt text in `docs/ASSETS.md`. Store permitted assets reliably; avoid random image endpoints and fragile hotlinks. Optimize delivery and preserve focal points at different screen sizes. Do not use image placeholders as final product content.

If an asset tool is unavailable, find the best available lawful route, continue independent work, and report the specific remaining asset gap. Do not claim unavailable assets were created.

## F. Catalog and fictional content

Seed **24 distinct products** across seating, tables, lighting, storage, and objects. Use stable IDs and slugs. Provide believable, varied descriptions and specifications.

Suggested hero products:

- Cove lounge chair — upholstered seat and oak frame.
- Vale sofa — low modular silhouette in textured fabric.
- Arc dining table — rounded solid-wood form.
- Plinth side table — compact stone volume.
- Halo pendant — opal glass and brushed metal.
- Reed floor lamp — slender, adjustable reading light.

Give every product a name, category, short and full description, images, material, finish, dimensions with units, care instructions, price, delivery estimate, and related products. Variants own their SKU, price, stock, options, and relevant imagery. Store money in integer minor units.

Include in-stock, low-stock, and unavailable examples. Keep displayed stock truthful to the demo database. Use curated collections and three room stories. Write three complete short journal articles about materials, lighting, or room composition. Prefer specifics over repeated phrases such as “timeless luxury” and “elevate your space.”

## G. Sitemap

Implement these meaningful routes, adapting exact naming to existing project conventions:

- `/`: editorial storefront homepage.
- `/shop`: complete catalog with filters and sorting.
- `/collections/[slug]`: curated collection pages.
- `/products/[slug]`: product detail pages.
- `/rooms` and `/rooms/[slug]`: shoppable room stories.
- `/journal` and `/journal/[slug]`: editorial content.
- `/about`: studio story and material philosophy.
- `/search`: shareable search results, connected to header search.
- `/wishlist`: saved products.
- `/cart`, `/checkout`, and protected order confirmation.
- `/account` and protected order detail: demo profile, saved addresses, and order history.
- `/contact`: working inquiry form.
- `/delivery-returns`, `/care`, `/privacy`, `/terms`: concise, coherent demo information.
- `/demo`: entry to the interactive customer/admin demonstration and explanation of its limits.
- `/admin`: dashboard with catalog, inventory, orders, and inquiries.

Provide useful not-found, empty, loading, and error states. Do not render an unrelated default product for an invalid slug.

## H. Homepage composition

Make the first viewport exceptional and immediately legible as a furniture store. Include the wordmark, understandable shopping navigation, a dominant architectural image, one concise headline, and a clear link to the collection. Suggested headline: **Good rooms begin with a few good pieces.**

Compose the remaining page with changing rhythm: selected pieces; one immersive shoppable room; a short material story; a lighting-focused section with a different composition; journal selections; and a considered footer. Edit the sequence if a stronger narrative emerges.

Use actual seeded products and real destinations. The hero should lead somewhere specific. Avoid an automatic carousel as the main hero. Shopping, search, wishlist, and cart access must remain discoverable.

## I. Catalog and search experience

Support keyword search and filters for category, material/finish, availability, and price, with useful sorting. Encode filters and sorting in URL parameters so refresh, sharing, and browser back work correctly.

Show result counts, active filters, clear-all, useful no-results suggestions, and proper loading behavior. On mobile, use an accessible filter sheet with explicit apply/reset behavior.

Product tiles must show the correct product image, name, price or “from” price, finish availability, and wishlist state. If quick-add needs a variant selection, open a selector instead of silently choosing the wrong SKU.

## J. Product page and room interactions

Provide a responsive image gallery with accessible zoom, clear price and availability, labeled variant selection, quantity control, add-to-cart feedback, and a wishlist action. Include dimensions, materials, care, delivery/returns information, and considered recommendations.

Changing a variant updates its price, SKU, availability, and relevant visual representation. Unavailable combinations are explained and cannot be purchased. Add-to-cart should open or update a polished cart drawer without losing the user's place.

Use a sticky purchase area where it improves usability, including a compact mobile purchase bar that never obscures content or focus.

Room scenes may use keyboard-accessible hotspots opening product summaries. Always provide an equivalent product list. A “shop the room” action must show products, quantities, variants, availability, and total before adding them.

## K. Cart and pricing rules

Persist cart and wishlist state across refreshes. Merge identical variants, validate quantities, support removal, and provide helpful empty states. Revalidate server-side when products, prices, or availability change.

Use explicit demo commerce rules: USD catalog; standard delivery $75 below a $1,500 merchandise subtotal and free at or above $1,500; white-glove delivery $150 as an alternative total delivery fee. No promotions or currency conversion in the initial scope. Calculate eligibility consistently.

For this fictional scenario, displayed prices include any applicable demo tax; no additional tax is added. Label this as a demonstration assumption in checkout/help and documentation, not verified tax guidance. Keep shipping and tax rules in one tested module so a real client's rules can replace them.

Derive totals from trusted catalog data on the server. Client-provided prices, fees, roles, and payment statuses are never authoritative.

## L. Checkout, payment, and order lifecycle

Implement guest checkout with contact details, delivery address, delivery method, order review, validation, and a clear final total. Preserve entered values after validation errors.

**The complete default experience must run without external payment credentials.** Implement a server-side simulated payment provider with visible success and declined-payment scenarios. It must create real persisted demo orders, use the same pricing/inventory services as other payment adapters, and never ask visitors for real card details.

The checkout button must clearly say it places a demo order. Confirmation must show purchased variants, totals, delivery choice, order reference, and access to the corresponding order record.

Protect against duplicate submissions and overselling. In the default simulator, successful payment/order creation and stock deduction should be atomic; a decline must not reduce stock or produce a paid order. Snapshot order line descriptions and prices so later catalog edits do not alter previous purchases. Implement cancellation before shipment with a single stock restoration and a clearly simulated refund state.

Structure the payment boundary so Stripe test mode can be added. If usable test credentials are already available, integrate and verify it with signed, idempotent webhook handling and explicit stock reservation/release behavior. Otherwise, document that adapter as unimplemented; the built-in simulator remains the completed default. Never claim a redirect alone verifies payment or call the simulator a verified Stripe integration.

## M. Account and public demo isolation

Use an explicit **Enter demo account** experience. It should create an unguessable, server-recognized demo identity with sample profile/address data, persistent cart/wishlist, and isolated orders. Do not display fake password sign-in or registration forms that lack real authentication.

Support customer and merchant views within the same isolated demo workspace, so visitors can place an order and then inspect it in the merchant dashboard. Public merchant access must grant permission only within that workspace. It is not access to a shared production admin.

Enforce workspace ownership on the server for every read and mutation, including direct object URLs and server actions. Keep secrets and session credentials out of client bundles. Use secure session-cookie handling and validate untrusted input. A hidden admin link is not an authorization boundary.

Let visitors reset their own demo workspace with confirmation. Never allow them to reset other visitors' data. Define expiration and cleanup for abandoned workspaces. Clearly distinguish this demonstration identity system from production customer authentication in the README.

## N. Merchant dashboard

Design the admin as a calm, efficient extension of the brand. Use clear tables, forms, filters, and status badges. Its visual purpose is operating the business.

Implement product creation/editing/archiving, variant prices and stock, order filtering/detail, permitted order status transitions, and inquiry management. Use an asset-library picker for product imagery; arbitrary file upload infrastructure is outside the initial scope.

Expose meaningful order states, such as paid, processing, shipped, delivered, and cancelled, with valid transitions. Shipping and delivery updates are simulated and visibly identified as such. Persist an activity record for important mutations.

Dashboard counts and totals must come from the current workspace's actual records, with clear treatment of cancelled/refunded orders. Do not invent revenue graphs. Changes must appear in that workspace's storefront after appropriate cache invalidation.

## O. Forms, messages, and honest simulation

Contact inquiries and any newsletter form displayed must validate and persist submissions, handle duplicates appropriately, and expose relevant records to the demo merchant. Do not show “sent” if nothing was stored or sent.

Provide a local/demo outbox or message preview for order confirmations and contact acknowledgments. External email delivery is optional and must be identified as unconfigured when unavailable. Never send emails, texts, or inquiries to real businesses as part of demonstrating the site.

Use sample contact details from reserved example domains. Place a discreet but legible concept-project disclosure in the footer and a clear demo notice at checkout and demo entry. Explain that no products are sold or shipped. Keep engineering terminology out of normal shopping copy except where visitors need it to understand the simulation.

## P. Next.js architecture

Next.js is required. Use the current supported stable release compatible with the project, App Router, TypeScript in strict mode, and supported React versions. Inspect the existing repository first; preserve useful work and its package manager. Verify version-specific APIs in official documentation rather than guessing or automatically upgrading everything.

Use Server Components for suitable content/data work and small Client Components for interaction, following the [official Next.js server/client guidance](https://nextjs.org/docs/app/getting-started/server-and-client-components). Keep database access, authorization, payment logic, and secrets server-side. Use Server Actions or Route Handlers deliberately, with validation and authorization inside each mutation path.

Use Tailwind CSS and/or scoped CSS with shared semantic design tokens. Accessible headless primitives are welcome, but author the visual layer. Use CSS for simple motion; add one animation library only when needed. Do not install multiple overlapping UI or state libraries.

Default persistence: a real SQLite database with a compatible Drizzle setup for local development, migrations, and deterministic seeds. Isolate persistence behind a small data-access layer. If the existing project already has a suitable relational database, use it and explain the decision.

Use a Node runtime for database-backed routes. Document a production deployment path with persistent storage or a compatible hosted database. Do not assume a serverless host's local filesystem is durable. Do not switch to in-memory data or browser-only orders to hide a database issue.

Keep features organized around catalog, cart, checkout/orders, demo sessions, content, and admin. Avoid a single giant page component and unnecessary enterprise abstractions.

## Q. Data model and boundaries

Model products, categories/collections, variants, assets, room scenes and their products, journal entries, demo workspaces/sessions, carts/items, wishlists, addresses, orders/items, payment attempts, inquiries, subscriptions if used, message outbox, and admin activity as needed.

Use database constraints and transactions for important invariants. Validate input with a shared schema library. Keep price calculations, stock changes, order transitions, and ownership checks centralized and testable. Scope caches to workspace identity where content is personalized; never leak cached account or admin data across visitors.

Shared editorial content may use typed local content or MDX. Commerce records and submitted data require database persistence. Implement migrations and seeds that are safe to rerun. Demo resets must be scoped explicitly.

## R. Responsive design and accessibility

Design mobile intentionally. Validate at approximately 360–390px, 768px, 1024px, and 1440px, plus the actual preview viewport. Handle long product names, multiline prices, empty lists, and larger text without overflow.

Use semantic landmarks, logical headings, visible labels, keyboard navigation, meaningful image alternatives, accessible validation, and visible focus. Target WCAG 2.2 AA; do not claim audited conformance based on automated checks alone.

Dialogs and drawers need appropriate focus management, Escape handling, accessible names, and focus restoration. Announce cart and form status changes appropriately. Use generous touch targets, aiming for at least 44px for primary controls. Never depend on hover, color, drag, or hotspots alone to convey essential functionality. Verify text and control contrast.

## S. Motion and interaction craft

Use motion to clarify state changes and support the tactile identity. Favor controlled image transitions, restrained product hover behavior, material-selection feedback, and well-paced drawer transitions.

Use roughly 150–250ms for small feedback and 300–450ms for larger transitions, adjusting to the interaction. Avoid animating layout properties unnecessarily. Honor reduced-motion preferences and ensure content remains visible if animation fails or JavaScript loads slowly.

Do not delay add-to-cart, search, or checkout for decorative animation. Mobile interactions must feel as considered as desktop interactions.

## T. Performance and discoverability

Optimize imagery with appropriate Next.js facilities, responsive sizing, reserved dimensions, and sensible loading priorities; consult the [official image optimization documentation](https://nextjs.org/docs/app/getting-started/images) for the installed version. Prioritize the actual hero/LCP image, lazy-load appropriate offscreen assets, and avoid shipping oversized originals. Load fonts predictably and minimize unnecessary client JavaScript.

Include meaningful route metadata, canonical-URL configuration, social images, favicon, and an indexing policy. Public portfolio demos should default to `noindex` so fictional product offers do not appear as real commercial listings. Protect account/admin content through authorization as well as indexing controls. Document what changes when a real merchant launches.

Measure representative homepage and product-page performance. Aim for Lighthouse mobile Performance of 90 or better under documented conditions, but report actual measurements and tradeoffs. A score is not a guarantee of real-world Core Web Vitals or accessibility.

## U. Durable project instructions and documentation

Create or carefully update these files. Read existing instructions first and preserve applicable project rules. Do not create competing sources of truth.

- `AGENTS.md`: concise operating rules for future AI sessions; read order; design priority; authority of project documents; architecture boundaries; data/demo safety; coding conventions; actual verification commands; completion criteria. Link detailed documents rather than duplicating the full brief.
- `README.md`: purpose, fictional-brand disclosure, screenshots, implemented features, exact prerequisites and versions, package-manager commands, environment setup, database migration/seed/reset, running/building/testing, demo entry, customer-to-admin walkthrough, payment/email modes, deployment/storage constraints, limitations, and asset credits.
- `PRODUCT.md`: audience, brand background, catalog, scope, routes, workflows, demo commerce rules, acceptance criteria, and explicit exclusions.
- `DESIGN.md`: palette and semantic roles, typography, grids, spacing, imagery direction, responsive decisions, component states, motion, accessibility rules, and anti-patterns. Update it to match the actual implementation.
- `docs/ARCHITECTURE.md`: feature boundaries, data model, session isolation, authorization, money/stock/order handling, providers, caching, and deployment decisions.
- `docs/ASSETS.md`: source and licensing/provenance register, prompts where applicable, product associations, and asset gaps.
- `docs/QA.md`: required scenarios, commands and results actually run, viewport captures, accessibility/performance findings, and unresolved issues.
- `docs/STATUS.md`: concise completed/pending/blocked checklist and next concrete action for resuming across sessions.
- `.env.example`: documented non-secret configuration examples; never real credentials.

Keep documentation proportionate and executable. Do not spend most of the project writing plans. Do not mark unbuilt features complete or make README claims unsupported by the running app.

## V. Working rules for the AI

Read `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, and `docs/STATUS.md` at the start of later sessions, plus relevant architecture sections. Preserve established visual decisions unless evidence or my instructions justify changing them.

Use available design skills deliberately. Make ordinary reversible decisions yourself, record important assumptions, and continue. Do not repeatedly ask me to choose fonts, colors, libraries, component details, or the next development step.

Ask only for genuinely required information, a material conflict, or an action needing authorization. Missing optional provider credentials must not block the default demo. Do not purchase services, register domains, enable live payments, publish externally, or modify unrelated projects without authorization.

Keep progress updates brief and concrete. Inspect rendered work rather than assuming code looks good. Fix root causes, preserve user changes, avoid unnecessary dependencies, and never disable type, lint, or build checks simply to obtain a passing result. Use tools actually available; do not claim nonexistent browser access, image generation, test results, deployment, or background continuation.

If work spans sessions, leave an accurate checkpoint and resume from it. Do not silently reduce the required scope or use “future enhancement” to dismiss a required feature.

## W. Build sequence

1. Inspect the repository and its instructions, tools, and runtime. Establish concise project documents and a tracked plan.
2. Develop the art direction, wordmark, image plan, shared tokens, and six featured products. Research only enough references to make specific design decisions.
3. Build a fully composed homepage and one excellent product detail page using representative final-quality imagery. Inspect desktop and mobile, then correct the visual direction before extending the system. This is an internal quality checkpoint; continue without requiring my approval for routine design choices.
4. Complete the catalog, collections, room stories, editorial pages, and persistent shopping interactions.
5. Implement and verify the complete cart-to-checkout-to-order-to-admin workflow with real persistence and isolated demo sessions.
6. Finish secondary states, responsive behavior, accessibility, performance, and documentation. Prepare the deployment path without publishing unless authorized.

Do not build an elaborate admin system before establishing the storefront's visual quality. Also do not stop at the visual checkpoint: all required workflows remain part of completion.

## X. Verification

Run the project's actual typecheck, lint, production build, and focused automated tests. Add meaningful tests for money calculations and shipping boundaries, invalid quantities, stock competition, duplicate submissions, cancellation/restocking, order ownership, and cross-workspace authorization.

Exercise these end-to-end scenarios in a browser where tools permit:

1. Search/filter products, open a result, choose a valid variant, add it, and edit the cart.
2. Refresh and verify cart/wishlist persistence.
3. Submit invalid checkout fields and recover without losing valid input.
4. Complete a successful simulated purchase and verify order totals, stock, confirmation, and account history.
5. Trigger a declined payment and verify honest feedback with unchanged stock.
6. Repeat a submission and confirm it does not create duplicate paid orders.
7. Inspect the order in the corresponding demo merchant view, change a permitted status, and see the customer update.
8. Verify two separate visitor workspaces cannot read or mutate one another's data; resetting one leaves the other intact.
9. Submit a contact inquiry and find it in the correct admin workspace.
10. Navigate a representative shopping flow with keyboard controls and at mobile widths.

Inspect homepage, catalog, product, cart, checkout, account, and admin screenshots in a batched visual pass. Check image consistency, typography, composition, spacing, contrast, loading, and overflow. Fix material findings together and perform one confirmation pass. Avoid endless aesthetic micro-edits after the acceptance criteria are met.

Record failures and unrun checks accurately. Do not equate a passing build with a verified shopping experience.

## Y. Scope boundaries and completion bar

Required: all specified storefront routes and content, 24 products, six fully illustrated featured products, three room stories, three journal articles, real cart/wishlist persistence, working credential-free checkout, persistent isolated orders, demo account/admin, working forms, responsive states, and accurate project documentation.

Outside initial scope: real-money sales, actual shipping, real customer authentication, marketplace vendors, augmented reality, a 3D room planner, AI chatbots, multi-currency conversion, complex promotions, ERP integrations, and a general-purpose CMS. Do not introduce those features at the expense of the required experience.

Optional external integrations must be listed separately as verified, unverified, or unimplemented. Their absence does not excuse defects in the default local demo.

Completion requires a coherent visual identity across all routes; final-quality relevant imagery; no dead buttons or placeholder destinations; correct persisted shopping/admin behavior; no known cross-visitor data exposure; a working production build; and documented evidence of the checks actually performed. If something remains blocked, name it precisely and do not call the whole project complete.

## Z. Final handoff and immediate next action

At handoff, provide the local preview URL, a short visual summary, key desktop/mobile screenshots if supported, exact run commands, customer/admin demo instructions, verification results, and any remaining configuration or limitations. Save useful portfolio screenshots and a short factual case-study draft describing the design problem, decisions, and implemented workflows. Include no invented commercial results.

**Begin now by inspecting the project and establishing the durable instructions, then build the first complete visual slice and continue through the required working store. The result should make a prospective client want this agency to design their own website.**
