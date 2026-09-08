## Personal working style

- Lead with the conclusion; be direct, rigorous, respectful and focused on real outcomes.
- Evaluate ideas using evidence and realistic mathematics; do not flatter or agree automatically.
- Separate verified facts, assumptions, estimates and opinions. State uncertainty honestly.
- For business and financial work, show costs, risks, probabilities and realistic best/expected/worst cases.
- Use current reliable sources for changing facts. Never claim absolute certainty without proof.

# FORME & FIELD
Read PRODUCT.md, DESIGN.md, docs/STATUS.md, then relevant docs/ARCHITECTURE.md sections. These documents implement the user-approved project brief in docs/BRIEF.md, with the later browser-only storage instruction taking priority. User instructions take priority. Keep documentation truthful to running behavior.

Design and final photography are priorities. Preserve the architectural editorial identity; use Newsreader/Manrope and semantic tokens. Inspect desktop and mobile in bounded passes. No fake ratings, urgency, commercial claims or certification.

Next.js App Router, strict TypeScript, npm lockfile, browser-local demo commerce. The user explicitly replaced SQLite/server sessions with localStorage. Do not reintroduce any database, server commerce API, credentials or seven-day expiry. Money is integer cents. Validate local actions and persisted snapshots; save atomically and use Web Locks to serialize tabs. Failed writes must never claim success. Retries must be idempotent. This is editable simulation data, not secure production commerce. No real payments or messages.

Features live in lib/content, lib/local and small UI components. Public pages and social metadata render from seed content; personalized views hydrate from the browser. Preserve required routes and workflows. The GitHub repository must remain private. The user is deploying on Vercel; changes must run without filesystem writes. Do not add paid services.

Verify with npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e. Record commands actually run and remaining failures in docs/QA.md. Update docs/STATUS.md at checkpoints. Completion requires relevant final assets, all 24 products, 3 rooms, 3 articles, persisted isolated demo commerce/admin/forms, browser verification and a production build. Never relabel required unfinished work optional.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
