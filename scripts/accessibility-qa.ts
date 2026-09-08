import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true }),
    context = await browser.newContext(),
    page = await context.newPage();
  await context.request.post(`${base}/api/demo`, {
    headers: { Origin: base },
    data: { action: 'enter' },
  });
  await context.request.post(`${base}/api/demo`, {
    headers: { Origin: base },
    data: { action: 'cart', variantId: 'v-1-1', quantity: 1, mode: 'add' },
  });
  const evidence: unknown[] = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/shop',
      '/products/cove-lounge-chair',
      '/cart',
      '/checkout',
      '/contact',
      '/account',
      '/admin',
      '/rooms/quiet-living',
    ]) {
      await page.goto(`${base}${route}`);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const violations = result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      }));
      evidence.push({ width, route, violations });
      console.log(JSON.stringify({ width, route, violations }));
    }
  }
  writeFileSync('docs/qa/accessibility-results.json', JSON.stringify(evidence, null, 2));
  await browser.close();
}
void main();
