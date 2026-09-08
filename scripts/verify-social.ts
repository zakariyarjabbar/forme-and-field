import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
const routes = [
  ['/', 'home'],
  ['/products/cove-lounge-chair', 'product-cove-lounge-chair'],
  ['/rooms/quiet-living', 'room-quiet-living'],
  ['/journal/the-character-of-oak', 'journal-the-character-of-oak'],
];
async function main() {
  const results = [];
  for (const agent of ['Discordbot', 'facebookexternalhit/1.1', 'Twitterbot', 'WhatsApp']) {
    for (const [route, image] of routes) {
      const response = await fetch(origin + route, { headers: { 'User-Agent': agent } });
      assert.equal(response.status, 200);
      const head = (await response.text()).split('</head>')[0];
      const imageUrl = `${origin}/images/social/${image}.jpg`;
      assert.ok(
        head.includes(`property="og:image" content="${imageUrl}"`),
        `${agent} ${route}: missing OG image in head`,
      );
      assert.ok(head.includes('name="twitter:card" content="summary_large_image"'));
      assert.ok(head.includes('property="og:image:width" content="1200"'));
      assert.ok(head.includes('property="og:image:height" content="630"'));
      assert.ok(head.includes('name="robots" content="noindex, nofollow"'));
      const asset = await fetch(imageUrl);
      assert.equal(asset.status, 200);
      assert.match(asset.headers.get('content-type') || '', /image\/jpeg/);
      const bytes = Buffer.from(await asset.arrayBuffer());
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.width, 1200);
      assert.equal(meta.height, 630);
      assert.ok(bytes.length < 1_000_000);
      results.push({ agent, route, image: imageUrl, bytes: bytes.length, status: 'passed' });
    }
  }
  const robots = await (await fetch(origin + '/robots.txt')).text();
  assert.ok(robots.includes('User-Agent: Discordbot'));
  assert.ok(robots.includes('Disallow: /account'));
  writeFileSync(
    'docs/qa/social-preview-results.json',
    JSON.stringify({ checkedAt: new Date().toISOString(), origin, results }, null, 2) + '\n',
  );
  console.log(
    `${results.length} bot/route checks passed; JPEGs load anonymously, 1200×630, under 1 MB.`,
  );
}
void main();
