# Visual system

## Direction
A warm architectural journal with a usable object catalog. The storefront persuades through photographs, material specificity and compositional restraint. The merchant surface operates through clear tables and forms; editorial pages favor reading.

## Identity and tokens
Warm chalk #F4F0E9 canvas; olive charcoal #23251F ink/dark surfaces; oxblood #721F2C selected actions; pale sage #A6AC96 occasional fields; warm gray #6B6860 was the starting secondary text; the verified implementation uses #5F5D55 for sufficient contrast on the footer and secondary surfaces. Newsreader expressive serif display (400, italic where intentional) with Manrope UI/body. Carefully spaced uppercase wordmark, serif italic ampersand. Self-host the Latin Newsreader weight-only normal/italic files and Manrope through Next Font, with preloads and adjusted fallback metrics; included OFL licenses record usage. Use tokens in app/globals.css. Sharp or 2px corners; thin warm borders, generous 44px controls, consistent 1.5px icons.

## Composition
Desktop has a quiet service strip, centered wordmark and discoverable shop/search/saved/bag navigation. The opening pairs a large two-line editorial title and a concise shopping link above a dominant architectural photo, with a discreet room caption. Product tiles feel like objects on a shared paper field, with no surrounding card containers. Vary later rhythm: four-object row, immersive shoppable room, narrow material story, asymmetric lighting study, editorial articles. Display text scales with viewport (maximum 6rem); purposeful spacing and fine rules.

Product pages: two-column gallery and sticky purchase information, generated material detail photography, readable dimension specifications, labeled finish chips. Mobile uses a single column and an unobtrusive purchase bar that appears only once the main purchase controls have scrolled above the viewport. Shop uses a persistent desktop filter rail and accessible mobile apply/reset sheet. Merchant views retain typography/color but prioritize rows, status labels and forms.

## Interaction and accessibility
Visible focus, semantic landmarks, 16px body, 14px regular UI labels. Never use color alone for state. Native dialog focus trapping, Escape, names and focus restoration. Live status for cart/forms. 180–220ms feedback, 350ms drawer/image transitions. Reduced motion removes decorative transitions. Preserve text under no-JS server render; essential commerce requires JavaScript and is disclosed if disabled.

## Boundaries
No fake evidence, gradients/glass, pill-heavy controls, carousel hero, scroll hijacking, custom cursor, intro gate or mandatory 3D. No duplicated product images representing different objects or false finish photographs. Use explicit finish swatches where exact alternate photography is absent.

## Browser-local state
Personal pages show a short loading state until saved browser data has been read. The public catalog remains server-rendered from seeded content for fast browsing and chat previews. Existing product cards, catalog filters, room selection and details update from the local catalog after hydration. Storage failures appear as actionable alerts, and malformed saved data requires an explicit reset. Demo, checkout, account and policy copy states that records stay in this browser and clearing site data removes them. No visual redesign accompanies the storage migration.
