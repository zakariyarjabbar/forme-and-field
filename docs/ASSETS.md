# Asset register

All furniture and room imagery is original AI-generated conceptual artwork created for FORME & FIELD through the built-in image-generation tool. No stock photography, random endpoints or external image hotlinks are used. These are fictional product illustrations, not photographs of actual manufactured goods. Generation does not constitute trademark clearance or a guarantee of exclusive copyright.

The retained [generation manifest](assets/generation-manifest.json) records exact generation/edit prompts, tool-provided source paths, reference images, selected outputs, pixel dimensions, crop coordinates and inspection notes. The image agent inspected all nine final source atlases/scenes; the main implementation inspected the featured atlas, hero, rendered site and catalog associations. The original selected 1536×1024 PNG sources are retained under docs/assets/source/.

## Delivery and resolution

24 primary views, six alternate views, six detail views, three room scenes and one social preview are stored under public/images. Atlases were split with Sharp into native 512×512 panels and encoded as WebP at quality 88. Room scenes are 1536×1024 WebP. The social preview is a 1200×630 crop of quiet-living. Next Image serves appropriately sized WebP/AVIF variants. No AI recolouring is used to imply an unphotographed material. Alternate finish options display explicit colour swatches and a photograph disclaimer. Native 512-pixel product panels limit fine-detail zoom and large high-density displays.

## Product associations and alt-text basis

| Asset | Product | View / finish | Alt text basis |
| --- | --- | --- | --- |
| /images/cove-lounge-chair.webp | Cove lounge chair | Oat linen / natural oak | Cove lounge chair, Oat linen / natural oak |
| /images/cove-lounge-chair-alternate.webp | Cove lounge chair | Alternate view | Cove lounge chair, alternate view |
| /images/cove-lounge-chair-detail.webp | Cove lounge chair | Material detail | Cove lounge chair, material and construction detail |
| /images/vale-sofa.webp | Vale sofa | Oat linen | Vale sofa, Oat linen |
| /images/vale-sofa-alternate.webp | Vale sofa | Alternate view | Vale sofa, alternate view |
| /images/vale-sofa-detail.webp | Vale sofa | Material detail | Vale sofa, material and construction detail |
| /images/arc-dining-table.webp | Arc dining table | Natural oak | Arc dining table, Natural oak |
| /images/arc-dining-table-alternate.webp | Arc dining table | Alternate view | Arc dining table, alternate view |
| /images/arc-dining-table-detail.webp | Arc dining table | Material detail | Arc dining table, material and construction detail |
| /images/plinth-side-table.webp | Plinth side table | Pale travertine | Plinth side table, Pale travertine |
| /images/plinth-side-table-alternate.webp | Plinth side table | Alternate view | Plinth side table, alternate view |
| /images/plinth-side-table-detail.webp | Plinth side table | Material detail | Plinth side table, material and construction detail |
| /images/halo-pendant.webp | Halo pendant | Brushed brass | Halo pendant, Brushed brass |
| /images/halo-pendant-alternate.webp | Halo pendant | Alternate view | Halo pendant, alternate view |
| /images/halo-pendant-detail.webp | Halo pendant | Material detail | Halo pendant, material and construction detail |
| /images/reed-floor-lamp.webp | Reed floor lamp | Dark bronze | Reed floor lamp, Dark bronze |
| /images/reed-floor-lamp-alternate.webp | Reed floor lamp | Alternate view | Reed floor lamp, alternate view |
| /images/reed-floor-lamp-detail.webp | Reed floor lamp | Material detail | Reed floor lamp, material and construction detail |
| /images/line-dining-chair.webp | Line dining chair | Natural oak | Line dining chair, Natural oak |
| /images/fold-accent-chair.webp | Fold accent chair | Walnut / flax | Fold accent chair, Walnut / flax |
| /images/morrow-bench.webp | Morrow bench | Natural oak | Morrow bench, Natural oak |
| /images/low-stool.webp | Low stool | Natural walnut | Low stool, Natural walnut |
| /images/span-coffee-table.webp | Span coffee table | Natural walnut | Span coffee table, Natural walnut |
| /images/orbit-side-table.webp | Orbit side table | Natural oak | Orbit side table, Natural oak |
| /images/beam-console.webp | Beam console | Natural walnut | Beam console, Natural walnut |
| /images/gather-dining-table.webp | Gather dining table | Natural oak | Gather dining table, Natural oak |
| /images/dune-table-lamp.webp | Dune table lamp | Chalk ceramic | Dune table lamp, Chalk ceramic |
| /images/column-table-lamp.webp | Column table lamp | Pale travertine | Column table lamp, Pale travertine |
| /images/loop-wall-light.webp | Loop wall light | Brushed brass | Loop wall light, Brushed brass |
| /images/tilt-task-lamp.webp | Tilt task lamp | Black brass | Tilt task lamp, Black brass |
| /images/grid-sideboard.webp | Grid sideboard | Natural oak | Grid sideboard, Natural oak |
| /images/frame-shelf.webp | Frame shelf | Natural walnut | Frame shelf, Natural walnut |
| /images/nook-cabinet.webp | Nook cabinet | Natural oak | Nook cabinet, Natural oak |
| /images/vessel-vase.webp | Vessel vase | Bone ceramic | Vessel vase, Bone ceramic |
| /images/ridge-bowl.webp | Ridge bowl | Natural walnut | Ridge bowl, Natural walnut |
| /images/thread-wool-throw.webp | Thread wool throw | Oat wool | Thread wool throw, Oat wool |

## Room associations

| Asset | Shoppable objects | Alt text basis |
| --- | --- | --- |
| /images/quiet-living.webp | vale-sofa, cove-lounge-chair, plinth-side-table, reed-floor-lamp | A room to come back to |
| /images/gathered-around.webp | arc-dining-table, line-dining-chair, halo-pendant | Good company, simple things |
| /images/reading-corner.webp | cove-lounge-chair, plinth-side-table, reed-floor-lamp | A corner of your own |

Scene photographs use reference-conditioned product identities. Principal silhouettes, supports and finishes are coherent; synthesized grain/weave details vary between generated views. Each scene has an equivalent product list, and the hotspots use the manifest coordinates. Small decorative books, art, rugs and architectural elements are styling props and are not represented as purchasable items. The dining scene includes six Line chairs and the shop-room set uses that quantity.

## Typography and identity

Newsreader Variable and Manrope Variable are sourced through Fontsource and served through next/font/local (Latin normal/italic Newsreader weight-only files; Latin Manrope weight file). [Newsreader OFL](assets/newsreader-OFL.txt) and [Manrope OFL](assets/manrope-OFL.txt) are retained. The typographic wordmark and favicon are authored vector/text treatments. Lucide icons are provided by the installed lucide-react package under its ISC license. No third-party brand marks are used.

## Gaps and restrictions

No required image slot is missing. Product panels are lower resolution than the initial 700-pixel target; larger original generations would improve zoom fidelity. Exact photography for alternate material finishes is unavailable and explicitly represented by labelled swatches. Asset prompts and rendered screenshots provide concept provenance, not proof of manufacturing or real-world specifications.

## Social sharing cards

`public/images/social/` contains 31 static JPEGs at 1200×630: `home.jpg`, `product-{slug}.jpg` for the 24 seeded products, `room-{slug}.jpg` for three rooms, and `journal-{slug}.jpg` for three articles. `scripts/social-assets.ts` composes the existing selected photographs with the licensed Newsreader/Manrope fonts in an authored HTML/CSS layout and renders them with Chrome. Source photographs are unchanged; provenance and generation prompts remain those in the register above. The new layout supplies the brand wordmark and page title; metadata includes descriptive image alternatives. No new image-generation claim is made. The earlier plain `social-preview.webp` is retained as an unused source-era export.
