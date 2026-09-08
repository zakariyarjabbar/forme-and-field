import { applyAction, initialData, STORAGE_KEY } from '../lib/local/store';
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true }),
    context = await browser.newContext({ reducedMotion: 'reduce' }),
    page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let local = initialData();
  async function post(input: Record<string, unknown>) {
    const outcome = applyAction(local, input);
    local = outcome.data;
    return { result: outcome.result };
  }
  await post({ action: 'enter' });
  await post({ action: 'cart', variantId: 'v-1-1', quantity: 1, mode: 'add' });
  const order = await post({
    action: 'checkout',
    data: {
      key: crypto.randomUUID(),
      delivery: 'standard',
      scenario: 'success',
      expectedTotal: 96500,
      address: {
        name: 'Alex Morgan',
        email: 'alex@example.com',
        line1: '24 Example Lane',
        line2: 'Apartment 2',
        city: 'Portland',
        region: 'Oregon',
        postal: '97201',
        country: 'United States',
      },
    },
  });
  if (!order.result.order) throw new Error('QA order was not created');
  await post({ action: 'cart', variantId: 'v-4-1', quantity: 1, mode: 'add' });
  await post({ action: 'cart', variantId: 'v-6-1', quantity: 1, mode: 'add' });
  await post({
    action: 'inquiry',
    data: {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      topic: 'Product question',
      message: 'Could the Cove chair and Plinth side table work in a small reading corner?',
    },
  });
  await context.addInitScript(
    ({ key, data }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, data);
    },
    { key: STORAGE_KEY, data: JSON.stringify(local) },
  );
  mkdirSync('docs/qa', { recursive: true });
  const evidence: unknown[] = [];
  for (const [width, height, label] of [
    [1440, 1000, 'desktop'],
    [390, 844, 'mobile'],
    [360, 800, 'small-phone'],
    [768, 1024, 'tablet'],
    [1024, 900, 'small-desktop'],
  ] as const) {
    await page.setViewportSize({ width, height });
    for (const [route, name] of [
      ['/', 'home'],
      ['/shop', 'catalog'],
      ['/products/cove-lounge-chair', 'product'],
      ['/cart', 'cart'],
      ['/checkout', 'checkout'],
      ['/account', 'account'],
      ['/admin', 'admin'],
    ] as const) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = 'eager';
        await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
        await document.fonts.ready;
      });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        fonts: Array.from(document.fonts)
          .filter((f) => f.status === 'loaded')
          .map((f) => f.family),
        brokenImages: Array.from(document.images)
          .filter((i) => !i.naturalWidth)
          .map((i) => i.alt),
      }));
      evidence.push({ route, width, height, ...state });
      if (label === 'desktop' || label === 'mobile') {
        await page.screenshot({ path: `docs/qa/${name}-${label}.png`, fullPage: true });
        if (name === 'home') await page.screenshot({ path: `docs/qa/home-${label}-viewport.png` });
      }
    }
    console.log(`${label}: seven routes inspected`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/admin/orders/${order.result.order.id}`);
  await page.screenshot({ path: 'docs/qa/order-desktop.png', fullPage: true });
  writeFileSync(
    'docs/qa/visual-results.json',
    JSON.stringify(
      { date: new Date().toISOString(), browser: browser.version(), evidence, errors },
      null,
      2,
    ),
  );
  await context.close();
  await browser.close();
  console.log('Visual evidence saved.');
}
void main();
