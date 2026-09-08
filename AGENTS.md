## Personal working style

- Lead with the conclusion; be direct, rigorous, respectful and focused on real outcomes.
- Evaluate ideas using evidence and realistic mathematics; do not flatter or agree automatically.
- Separate verified facts, assumptions, estimates and opinions. State uncertainty honestly.
- For business and financial work, show costs, risks, probabilities and realistic best/expected/worst cases.
- Use current reliable sources for changing facts. Never claim absolute certainty without proof.

# FORME & FIELD
Read PRODUCT.md, DESIGN.md, docs/STATUS.md, then relevant docs/ARCHITECTURE.md sections. These documents implement the user-approved project brief in docs/BRIEF.md. User instructions take priority. Keep documentation truthful to running behavior.

Design and final photography are priorities. Preserve the architectural editorial identity; use Newsreader/Manrope and semantic tokens. Inspect desktop and mobile in bounded passes. No fake ratings, urgency, commercial claims or certification.

Next.js App Router, strict TypeScript, npm lockfile, server-only commerce, SQLite/Drizzle. Money is integer cents. All private reads and writes require workspace ownership; server pricing and inventory are authoritative. Never trust client roles, prices or payment status. Mutations must validate, transactions must preserve stock, retries must be idempotent. No real payments or messages. No publishing without authorization.

Features live in lib/content, lib/db, lib/server, and small UI components. Keep browser bundles free of database/session credentials. Changes must preserve all required routes and workflows.

Verify with npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. Record commands actually run and remaining failures in docs/QA.md. Update docs/STATUS.md at checkpoints. Completion requires relevant final assets, all 24 products, 3 rooms, 3 articles, persisted isolated demo commerce/admin/forms, browser verification and a production build. Never relabel required unfinished work optional.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
