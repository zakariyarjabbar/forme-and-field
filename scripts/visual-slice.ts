import { chromium } from '@playwright/test';
async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    for (const [route, label] of [
      ['/', 'home'],
      ['/products/cove-lounge-chair', 'product'],
    ] as const) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: `docs/qa/slice-${label}-${name}.png`, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      console.log(`${name} ${route}: ${await page.title()}; overflow=${overflow}`);
    }
  }
  await browser.close();
}
void main();
