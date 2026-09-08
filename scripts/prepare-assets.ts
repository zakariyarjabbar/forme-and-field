import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'node:fs';
import { seedProducts } from '../lib/content/catalog';
const source = 'docs/assets/source';
mkdirSync('docs/assets', { recursive: true });
const groups = [
  ['featured-primary-atlas', seedProducts.slice(0, 6), ''],
  ['secondary-02-primary-atlas', seedProducts.slice(6, 12), ''],
  ['secondary-03-primary-atlas', seedProducts.slice(12, 18), ''],
  ['secondary-04-primary-atlas', seedProducts.slice(18, 24), ''],
  ['featured-alternate-atlas', seedProducts.slice(0, 6), '-alternate'],
  ['featured-detail-atlas', seedProducts.slice(0, 6), '-detail'],
] as const;
async function main() {
  for (const [atlas, products, suffix] of groups)
    for (let i = 0; i < products.length; i++)
      await sharp(`${source}/${atlas}.png`)
        .extract({ left: (i % 3) * 512, top: Math.floor(i / 3) * 512, width: 512, height: 512 })
        .webp({ quality: 88 })
        .toFile(`public/images/${products[i].slug}${suffix}.webp`);
  for (const room of ['quiet-living', 'gathered-around', 'reading-corner'])
    await sharp(`${source}/${room}.png`).webp({ quality: 88 }).toFile(`public/images/${room}.webp`);
  await sharp(`${source}/quiet-living.png`)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .webp({ quality: 86 })
    .toFile('public/images/social-preview.webp');
  for (const font of ['newsreader', 'manrope'])
    copyFileSync(
      `node_modules/@fontsource-variable/${font}/LICENSE`,
      `docs/assets/${font}-OFL.txt`,
    );
  console.log('Prepared 40 local webp assets; native panels 512×512, room scenes 1536×1024.');
}
void main();
