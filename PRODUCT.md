# FORME & FIELD

A fictional contemporary furniture and lighting studio and agency portfolio demonstration. Design-conscious homeowners, interior designers and small hospitality studios should browse a memorable editorial store, place a simulated order, then operate its isolated merchant workspace. Brand line: Furniture, lighting, and the spaces between.

## Brand commitments
An architectural interiors publication with excellent shopping. Tactile oak, walnut, linen, wool, brushed metal, opal glass and stone. Confident, warm, precise, quietly expressive. No invented history, makers, clients, reviews, awards or sustainability claims. The detailed approved requirements are in docs/BRIEF.md.

## Stack
Web: Next.js App Router with supported React, TypeScript strict, npm, scoped/global semantic CSS, localStorage for each browser, Next.js on Vercel. No database or external credentials required. The GitHub repository remains private.

## Scope and flows
24 products in seating, tables, lighting, storage, objects. Six featured products have primary, context and detail images. Three shoppable rooms and three complete journal stories. Homepage, shop, collections, products, rooms, journal, about, search, wishlist, cart, checkout, local order confirmation, account/orders, contact, care, delivery-returns, privacy, terms, demo and admin. URL filters and sorting; accessible gallery, material variants, stock, wishlist, cart drawer; browser-persisted orders, addresses, inquiries, outbox and admin activity.

All shopping and merchant data is saved in the current browser on the current website origin. Enter demo account exposes that browser's customer/merchant views with a sample profile. Tabs share data and coordinate writes. Separate browsers, devices and origins do not share records. No authentication or server authority is claimed. Clearing site data, browser eviction or a confirmed reset removes records; no seven-day expiry or cloud backup exists.

## Demo commerce rules
USD cents. Standard delivery $75 below $1,500 merchandise, free at/above $1,500. White glove is a $150 alternative total fee. Prices include any applicable demo tax and no extra tax is added; this is a scenario assumption. Browser-local payment simulator with success and decline. Atomic local snapshot purchase and stock deduction, idempotency, immutable order snapshots, cancellation before shipment and exactly-once restocking/refund simulation.

## Completion criteria
All requirements in docs/BRIEF.md remain required. Final relevant assets, coherent responsive visual identity, no dead controls, persisted workflows and forms, browser isolation and same-origin tab synchronization, tested local price/stock/idempotency rules, type/lint/build pass, actual browser and performance evidence. No real transactions, external messages, production authentication, database services or file uploads. Browser storage is intentionally editable and not a security boundary for real commerce.
