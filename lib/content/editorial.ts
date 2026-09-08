import type { Room, Article } from '../types';
export const rooms: Room[] = [
  {
    slug: 'quiet-living',
    title: 'The art of doing less.',
    subtitle: 'A room to come back to',
    intro:
      'An open room, a generous sofa, a chair turned toward the light. Sometimes a few considered pieces are all a space needs.',
    image: '/images/quiet-living.webp',
    body: [
      'We began with the low, horizontal line of Vale. Its textured upholstery holds the middle of the room without making it feel full. Cove sits just beyond it, angled toward both the window and whoever is on the sofa.',
      'A small travertine Plinth adds weight beside the chair. Reed brings the light closer after dark. The remaining space is intentional: room to cross, to pause, and to live.',
    ],
    products: [
      { slug: 'vale-sofa', quantity: 1, x: 36, y: 54 },
      { slug: 'cove-lounge-chair', quantity: 1, x: 79, y: 58 },
      { slug: 'plinth-side-table', quantity: 1, x: 93, y: 68 },
      { slug: 'reed-floor-lamp', quantity: 1, x: 64, y: 44 },
    ],
  },
  {
    slug: 'gathered-around',
    title: 'A place at the table.',
    subtitle: 'Good company, simple things',
    intro:
      'An oval oak table, honest chairs, and one soft globe overhead. A room composed around being together.',
    image: '/images/gathered-around.webp',
    body: [
      'The curve of Arc leaves the room open at either end. Six Line chairs follow its edge, with enough space to draw a seat back and stay a little longer. The table feels substantial, while the open chair frames keep the composition light.',
      'Halo hangs over the centre rather than following the ceiling. Its opal surface spreads light across the wood and leaves the edges of the room quieter. A bowl is enough for the middle; the rest of the table belongs to the meal.',
    ],
    products: [
      { slug: 'arc-dining-table', quantity: 1, x: 50, y: 60 },
      { slug: 'line-dining-chair', quantity: 6, x: 17, y: 64 },
      { slug: 'halo-pendant', quantity: 1, x: 50, y: 18 },
    ],
  },
  {
    slug: 'reading-corner',
    title: 'Just one more chapter.',
    subtitle: 'A corner of your own',
    intro:
      'Comfort does not require a whole room. A chair, a small surface and the right light can make a place feel yours.',
    image: '/images/reading-corner.webp',
    body: [
      'Cove leaves a little daylight around its cushions, so even in a small corner it does not feel enclosed. Positioning the seat at an angle keeps the view into the room open.',
      'Plinth is close enough for a cup without interrupting the walk past. Reed directs light onto the page instead of across the room. Keep its shade below eye level when seated, and adjust until the page is evenly lit.',
    ],
    products: [
      { slug: 'cove-lounge-chair', quantity: 1, x: 59, y: 60 },
      { slug: 'plinth-side-table', quantity: 1, x: 31, y: 69 },
      { slug: 'reed-floor-lamp', quantity: 1, x: 76, y: 41 },
    ],
  },
];
export const articles: Article[] = [
  {
    slug: 'the-character-of-oak',
    title: 'On the character of oak',
    category: 'Materials',
    readTime: '4 minute read',
    image: '/images/arc-dining-table-detail.webp',
    intro:
      'A grain line, an eased edge, a change in light. Looking more closely at the material we live with.',
    sections: [
      {
        title: 'A surface with direction',
        body: 'Oak is a useful place to start when composing a room because its grain already carries a rhythm. Long boards can reinforce the length of a table, while a round section shows the timber differently at every angle. Before introducing another patterned surface, spend a moment looking at the one the wood provides.',
      },
      {
        title: 'Proportion before decoration',
        body: 'A thick top reads differently from a thin one even when both use the same timber. On Arc, the rounded edge softens the visual weight, while the broad pedestals repeat the curve below. Those relationships give the table its character without asking the surface to do everything.',
      },
      {
        title: 'Living with the grain',
        body: 'Place timber away from sustained heat and wipe spills promptly. A coaster is a small intervention that prevents a large ring. Dust with a soft cloth and use a slightly damp cloth when needed; do not soak the surface. The finish specification of a real purchased piece should always guide its care.',
      },
      {
        title: 'Let one material lead',
        body: 'A room does not need matching wood everywhere. An oak table can sit beside a darker walnut shelf when the difference feels deliberate. Repeat a tone once, keep the surrounding palette quiet, and allow the grain of each piece to remain legible.',
      },
    ],
  },
  {
    slug: 'a-lower-kind-of-light',
    title: 'A lower kind of light',
    category: 'Light & living',
    readTime: '3 minute read',
    image: '/images/reed-floor-lamp-alternate.webp',
    intro: 'After daylight fades, the most useful change may be bringing the light closer.',
    sections: [
      {
        title: 'Start where you sit',
        body: 'An overhead light makes a room visible. A reading light makes one part of it useful. Think first about the places you actually occupy: the end of the sofa, a chair beside a window, the small table where you write. Let those positions determine the next light.',
      },
      {
        title: 'Watch the shade',
        body: 'Place the light so its source is screened from your eyes in your usual seated position. Reed has an adjustable cone that can direct light onto a page without washing the whole room. Move the shade gradually and look for an even pool, without a bright reflection from the paper.',
      },
      {
        title: 'Build a quieter background',
        body: 'A shaded table lamp on the opposite side of a room can soften the jump between a bright reading area and a dark wall. You do not need identical fixtures. Keep their colour temperatures close and give each one a clear job.',
      },
      {
        title: 'Leave a little darkness',
        body: 'Not every corner needs equal light. A more subdued edge can make a room feel settled and give lit materials greater depth. Keep circulation routes visible and controls easy to reach; atmosphere should make everyday use easier.',
      },
    ],
  },
  {
    slug: 'room-to-breathe',
    title: 'Give a room room to breathe',
    category: 'Room notes',
    readTime: '4 minute read',
    image: '/images/quiet-living.webp',
    intro: 'Composition is as much about what fits between objects as the objects themselves.',
    sections: [
      {
        title: 'Begin with movement',
        body: 'Before adding furniture, trace the routes through a room: from door to seat, seat to window, sofa to table. A good arrangement keeps those journeys natural. Place the largest piece first, then leave enough clear space for the ordinary act of walking past it.',
      },
      {
        title: 'Choose a useful centre',
        body: 'A living room does not always need a coffee table in its middle. A compact side table can keep a drink close while leaving the floor open. In our quiet-living room, Plinth sits beside Cove and Vale stretches along the wall; the centre belongs to movement.',
      },
      {
        title: 'Vary the height',
        body: 'A low sofa, a slightly higher chair and one slender floor lamp create a measured change in height. A tall shelf can balance a wide table across the room. Think of the outline before selecting small accessories, and keep some wall visible between substantial pieces.',
      },
      {
        title: 'Stop while there is space',
        body: 'Use the room before filling every gap. A surface without an object can still catch light beautifully. Add only what repeated use asks for: a lamp for reading, a throw for the evening, a bowl where keys keep landing. That kind of arrangement develops its own logic.',
      },
    ],
  },
];
