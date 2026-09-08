import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { seedProducts } from '../lib/content/catalog';
import { rooms, articles } from '../lib/content/editorial';

// Render a code-native editorial layout; source photography remains unchanged.
const data = (path: string, mime: string) =>
  `data:${mime};base64,${readFileSync(path).toString('base64')}`;
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const font = (name: string) =>
  data(
    `node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`,
    'font/woff2',
  );
const cards = [
  {
    slug: 'home',
    title: 'Furniture, lighting, and the spaces between.',
    image: '/images/quiet-living.webp',
    product: false,
  },
  ...seedProducts.map((p) => ({
    slug: `product-${p.slug}`,
    title: p.name,
    image: p.images[0],
    product: true,
  })),
  ...rooms.map((r) => ({ slug: `room-${r.slug}`, title: r.title, image: r.image, product: false })),
  ...articles.map((a) => ({
    slug: `journal-${a.slug}`,
    title: a.title,
    image: a.image,
    product: true,
  })),
];
async function main() {
  mkdirSync('public/images/social', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    for (const card of cards) {
      await page.setContent(`<!doctype html><html><head><style>
        @font-face{font-family:Newsreader;src:url(${font('newsreader')})} @font-face{font-family:Manrope;src:url(${font('manrope')})}
        *{box-sizing:border-box}body{margin:0;background:#F4F0E9;color:#23251F;width:1200px;height:630px;padding:28px;font-family:Manrope}
        header{height:74px;display:flex;align-items:flex-start;justify-content:space-between;gap:30px}.brand{font-size:33px;letter-spacing:3px;white-space:nowrap}.brand span{font-family:Newsreader;font-style:italic;font-size:42px;letter-spacing:0}header p{font-size:18px;line-height:1.5;max-width:480px;margin:10px 0 0;text-align:right}
        .scene{width:1144px;height:500px;object-fit:cover;object-position:center}.product{display:grid;grid-template-columns:1fr 520px;gap:42px;height:500px;align-items:center}.product h1{font:400 66px/1.04 Newsreader;margin:0;letter-spacing:-1px}.product p{font-size:20px;line-height:1.5;margin-top:28px;max-width:350px}.product img{width:520px;height:500px;object-fit:cover}
      </style></head><body><header><div class="brand">FORME <span>&amp;</span> FIELD</div><p>${card.product ? 'Furniture, lighting, and the spaces between.' : escape(card.title)}</p></header>${card.product ? `<div class="product"><div><h1>${escape(card.title)}</h1><p>Considered design.<br>Quiet character.</p></div><img src="${data(`public${card.image}`, 'image/webp')}" /></div>` : `<img class="scene" src="${data(`public${card.image}`, 'image/webp')}" />`}</body></html>`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images).map((i) => i.decode()));
      });
      await page.screenshot({
        path: `public/images/social/${card.slug}.jpg`,
        type: 'jpeg',
        quality: 92,
      });
    }
    console.log(`Rendered ${cards.length} social cards at 1200×630.`);
  } finally {
    await browser.close();
  }
}
void main();
