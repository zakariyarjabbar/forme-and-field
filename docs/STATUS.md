# Status

## Browser-local migration — 2026-09-08

The user's latest instruction replaces all database storage with local browser data. The private GitHub repository remains https://github.com/zakariyarjabbar/forme-and-field.

- [x] Removed database dependencies, runtime filesystem writes, server commerce APIs, session cookies and database scripts.
- [x] Versioned localStorage data, validated copy-on-write actions, cross-tab Web Locks, storage-event synchronization and explicit corrupt-data reset.
- [x] Cart/wishlist, checkout success/decline, orders/cancellation, account/addresses, admin/catalog/inventory, inquiries/outbox/activity connected to local data.
- [x] Public seed rendering and 31 social preview cards preserved; local custom products render client-side.
- [x] Updated demo/policy copy and architecture for browser-owned data with no seven-day expiration.
- [x] Final typecheck, lint, 11 local-state tests and production build passed.
- [x] 11 browser journeys, 35 viewport checks, 18 axe scans and 16 social-preview checks passed.
- [x] Database-free application pushed to private GitHub and successfully deployed at https://forme-and-field.vercel.app.
- [x] Live social previews: 16 bot/route checks passed.
- [x] Final hydration guards and reliable demo-entry navigation passed all 11 local browser journeys.
- Targeted live navigation and route rechecks are pending deployment of the final fixes.

No Supabase/Neon account is needed. The Vercel deployment should use Next.js defaults, with NEXT_PUBLIC_SITE_URL set to the public origin or omitted for automatic detection. Remove stale database/cookie variables. Old local SQLite data is left on disk but unused and untracked.

Browser data is editable simulation state. It is shared across tabs on one origin, not across browser profiles/devices/domains. Clearing site data, eviction, private browsing cleanup or reset can remove it. No real payments, messages, authentication or cloud backup exists.
