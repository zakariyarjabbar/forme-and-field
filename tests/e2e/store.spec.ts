import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const address = {
  name: 'Jamie Sample',
  email: 'jamie@example.com',
  line1: '18 Example Street',
  line2: 'Unit 3',
  city: 'Portland',
  region: 'Oregon',
  postal: '97201',
  country: 'United States',
};
async function readLocal(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('forme-field:browser-demo:v1') || '{}'),
  );
}
async function enter(page: Page) {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Enter demo account', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
}
async function fillAddress(page: Page) {
  for (const [key, value] of Object.entries(address)) {
    if (key === 'country') await page.locator('select[name="country"]').selectOption(value);
    else await page.locator(`input[name="${key}"]`).fill(value);
  }
}
async function addCove(page: Page) {
  await page.goto('/products/cove-lounge-chair');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Your bag (1)' })).toBeVisible();
  await page.getByRole('link', { name: 'Continue to demo checkout' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
}

test('shopping, URL filters, variant selection, persistent bag and wishlist', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByText('24 pieces', { exact: true })).toBeVisible();
  await page.locator('.desktop-filters').getByLabel('Seating', { exact: true }).check();
  await page.locator('.desktop-filters').getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/category=Seating/);
  await expect(page.getByText('6 pieces', { exact: true })).toBeVisible();
  await page.getByLabel('Sort pieces').selectOption('price-asc');
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.reload();
  await expect(page.getByText('6 pieces', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Search pieces' }).click();
  await page.getByLabel('Search furniture, lighting or materials').fill('Cove lounge chair');
  await page.getByRole('dialog').getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText('1 piece', { exact: true })).toBeVisible();
  await page
    .getByRole('heading', { name: 'Cove lounge chair', exact: true })
    .getByRole('link')
    .click();
  await page
    .getByRole('button', { name: 'Moss linen / natural oak, currently unavailable' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Unavailable', exact: true }).first(),
  ).toBeDisabled();
  await expect(page.getByText(/exact photograph of this finish is not available/)).toBeVisible();
  await page.getByRole('button', { name: 'Oat linen / natural oak', exact: true }).click();
  await page.getByRole('button', { name: 'Save for later', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved to your wishlist' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to bag', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Your bag (1)' })).toBeVisible();
  await page.getByRole('button', { name: 'Increase Cove lounge chair' }).click();
  await expect(page.getByRole('dialog', { name: 'Your bag (2)' })).toBeVisible();
  await page.getByRole('button', { name: 'Close your bag (2)' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open bag, 2 items' }).click();
  await expect(page.getByRole('dialog', { name: 'Your bag (2)' })).toBeVisible();
  await page.getByRole('link', { name: 'View and edit bag' }).click();
  await page.getByRole('button', { name: 'Decrease Cove lounge chair' }).click();
  await expect(page.getByText('$965', { exact: true })).toBeVisible();
  await page.goto('/wishlist');
  await expect(page.getByRole('heading', { name: 'Cove lounge chair' })).toBeVisible();
});

test('invalid checkout recovers values, decline preserves stock, purchase reaches account and merchant', async ({
  page,
}) => {
  await addCove(page);
  await page.getByRole('button', { name: /Place demo order/ }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText('highlighted');
  await page.locator('input[name="name"]').fill(address.name);
  await page.locator('input[name="email"]').fill('bad-email');
  await page.getByRole('button', { name: /Place demo order/ }).click();
  await expect(page.locator('input[name="name"]')).toHaveValue(address.name);
  await fillAddress(page);
  await page.getByLabel('Simulated payment outcome').selectOption('decline');
  await page.getByRole('button', { name: /Place demo order/ }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText(
    'simulated payment was declined',
  );
  await expect(page.locator('input[name="line1"]')).toHaveValue(address.line1);
  const state = await readLocal(page);
  expect(state.products[0].variants[0].stock).toBe(12);
  expect(state.cart).toHaveLength(1);
  await page.getByLabel('Simulated payment outcome').selectOption('success');
  await page.getByRole('button', { name: /Place demo order/ }).click();
  await expect(page).toHaveURL(/\/checkout\/confirmation\/[0-9a-f-]+/);
  await expect(page.getByRole('heading', { name: 'A few good choices.' })).toBeVisible();
  await expect(page.getByText('$965', { exact: true })).toBeVisible();
  const id = page.url().split('/').pop()!;
  await page.locator('main').getByRole('link', { name: 'Your demo account', exact: true }).click();
  await page.getByRole('button', { name: 'Enter demo account' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back, Jamie.' })).toBeVisible();
  await page.goto(`/admin/orders/${id}`);
  await page.getByRole('button', { name: 'Simulate processing' }).click();
  await expect(page.locator('.status-badge')).toHaveText('processing');
  await page.goto(`/account/orders/${id}`);
  await expect(page.locator('.status-badge')).toHaveText('processing');
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Outbox', exact: true }).click();
  await page.getByText(/Your demo order FF-/).click();
  await expect(page.getByText(/No payment was collected/)).toBeVisible();
});

test('separate browsers, same-origin tabs, cancellation and local reset', async ({ browser }) => {
  const a = await browser.newContext(),
    b = await browser.newContext();
  const first = await a.newPage(),
    second = await b.newPage(),
    tab = await a.newPage();
  await enter(first);
  await enter(second);
  await first.goto('/products/cove-lounge-chair');
  await tab.goto('/products/cove-lounge-chair');
  await Promise.all(
    [first, tab].map((page) =>
      page.getByRole('button', { name: 'Add to bag', exact: true }).first().click(),
    ),
  );
  await expect.poll(async () => (await readLocal(first)).cart?.[0]?.quantity ?? 0).toBe(2);
  await expect(first.getByRole('dialog', { name: 'Your bag (2)' })).toBeVisible();
  expect((await readLocal(second)).cart).toHaveLength(0);
  await first.keyboard.press('Escape');
  await first.goto('/checkout');
  await fillAddress(first);
  await first.getByRole('button', { name: /Place demo order/ }).click();
  await expect(first).toHaveURL(/confirmation/);
  const id = first.url().split('/').pop()!;
  await second.goto(`/account/orders/${id}`);
  await expect(second.getByRole('heading', { name: 'This page has moved out.' })).toBeVisible();
  await first.goto(`/account/orders/${id}`);
  await first.getByRole('button', { name: 'Cancel demo order' }).click();
  await first.getByRole('button', { name: 'Confirm cancellation' }).click();
  await expect(first.locator('.status-badge')).toHaveText('cancelled');
  expect((await readLocal(first)).products[0].variants[0].stock).toBe(12);
  await addCove(second);
  await first.goto('/demo');
  await first.getByRole('button', { name: 'Reset my demo workspace' }).click();
  await first.getByRole('button', { name: 'Confirm reset of my workspace' }).click();
  await expect.poll(async () => (await readLocal(tab)).orders.length).toBe(0);
  expect((await readLocal(second)).cart).toHaveLength(1);
  expect((await a.cookies()).find((c) => c.name === 'ff_demo')).toBeUndefined();
  await a.close();
  await b.close();
});

test('contact persists honestly, duplicate is handled, merchant can resolve and inspect acknowledgment', async ({
  page,
}) => {
  await page.goto('/contact');
  await page.getByLabel('Your name').fill('Taylor Demo');
  await page.getByLabel('Email address').fill('taylor@example.com');
  await page.getByLabel('What’s on your mind?').selectOption('Product question');
  await page.getByLabel('Your message').fill('Would the Cove chair fit a small reading corner?');
  await page.getByRole('button', { name: 'Save demo inquiry' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'inquiry has been saved' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save demo inquiry' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'already saved' })).toBeVisible();
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Enter demo account' }).click();
  await page.getByRole('button', { name: /^Inquiries/ }).click();
  await page.getByRole('button', { name: 'Read inquiry' }).click();
  await expect(
    page.getByText('Would the Cove chair fit a small reading corner?', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Mark resolved' }).click();
  await expect(page.getByRole('button', { name: 'Reopen inquiry' })).toBeVisible();
  await page.getByRole('button', { name: 'Close product question' }).click();
  await page.getByRole('button', { name: 'Outbox', exact: true }).click();
  await page.getByText('Your FORME & FIELD demo inquiry', { exact: true }).click();
  await expect(page.getByText(/No external message was sent/)).toBeVisible();
});

test('merchant creates, edits, archives and restores a product with storefront propagation', async ({
  page,
}) => {
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Enter demo account' }).click();
  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  await page.getByRole('button', { name: 'Create product' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Product name', { exact: true }).fill('Sample oak chair');
  await dialog.getByLabel('URL slug').fill('sample-oak-chair');
  await dialog.getByLabel('Material', { exact: true }).fill('Solid oak & linen');
  await dialog.getByLabel('Short description').fill('A chair for a small, considered corner.');
  await dialog
    .getByLabel('Full description')
    .fill(
      'An original catalog-library chair shown here as a merchant-created sample in this isolated workspace.',
    );
  await dialog.getByLabel('SKU', { exact: true }).fill('FF-SAMPLE-001');
  await dialog.getByLabel('Price in USD cents').fill('50000');
  await dialog.getByLabel('Available stock').fill('8');
  await dialog.getByRole('button', { name: 'Save product' }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/products/sample-oak-chair');
  await expect(page.getByRole('heading', { name: 'Sample oak chair', exact: true })).toBeVisible();
  await expect(page.locator('.product-price')).toContainText('$500');
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  await page.getByLabel('Search products').fill('Sample oak chair');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Price in USD cents').fill('55000');
  await page.getByRole('dialog').getByLabel('Available stock').fill('2');
  await page.getByRole('button', { name: 'Save product' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeVisible();
  await page.goto('/products/sample-oak-chair');
  await expect(page.getByRole('heading', { name: 'This page has moved out.' })).toBeVisible();
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  await page.getByLabel('Search products').fill('Sample oak chair');
  await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await page.goto('/products/sample-oak-chair');
  await expect(page.locator('.product-price')).toContainText('$550');
  await expect(page.getByText('2 available in your demo', { exact: true })).toBeVisible();
});

test('mobile filters, keyboard dialog focus restoration, room shopping and no overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Lighting', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/category=Lighting/);
  await expect(page.getByText('6 pieces', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Filters/ }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Filters/ })).toBeFocused();
  await page.goto('/rooms/reading-corner');
  await page.getByRole('button', { name: 'Shop the room', exact: true }).click();
  await expect(dialog.getByText('Pieces subtotal')).toBeVisible();
  await dialog.getByRole('button', { name: 'Add selected pieces to bag' }).click();
  await expect(page.getByRole('dialog', { name: 'Your bag (3)' })).toBeVisible();
  await page.keyboard.press('Escape');
  for (const route of [
    '/',
    '/shop',
    '/products/cove-lounge-chair',
    '/cart',
    '/checkout',
    '/account',
    '/admin',
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      route,
    ).toBe(true);
  }
});

test('all specified public routes, invalid slugs and rendered images', async ({ page }) => {
  for (const route of [
    '/',
    '/shop',
    '/search?q=oak',
    '/wishlist',
    '/cart',
    '/checkout',
    '/account',
    '/demo',
    '/admin',
    '/about',
    '/contact',
    '/delivery-returns',
    '/care',
    '/privacy',
    '/terms',
    '/rooms',
    '/rooms/quiet-living',
    '/rooms/gathered-around',
    '/rooms/reading-corner',
    '/journal',
    '/journal/the-character-of-oak',
    '/journal/a-lower-kind-of-light',
    '/journal/room-to-breathe',
    '/collections/considered-essentials',
    '/collections/soft-geometry',
    '/collections/after-hours',
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  }
  for (const route of [
    '/products/missing',
    '/collections/missing',
    '/rooms/missing',
    '/journal/missing',
  ]) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'This page has moved out.' })).toBeVisible();
  }
  await page.goto('/');
  await page.evaluate(async () => {
    for (const img of document.images) {
      img.loading = 'eager';
      await img.decode().catch(() => {});
    }
  });
  const broken = await page
    .locator('img')
    .evaluateAll((images) =>
      images
        .filter((img) => !(img as HTMLImageElement).naturalWidth)
        .map((img) => img.getAttribute('src')),
    );
  expect(broken).toEqual([]);
});

test('automated accessibility scan on representative shopping and merchant surfaces', async ({
  page,
}) => {
  await enter(page);
  for (const route of [
    '/',
    '/shop',
    '/products/cove-lounge-chair',
    '/contact',
    '/account',
    '/admin',
  ]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
  }
});

test('blocked storage reports errors without claiming a save', async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'forme-field:browser-demo:v1') throw new DOMException('Full', 'QuotaExceededError');
      return set.call(this, k, v);
    };
  });
  await page.goto('/products/cove-lounge-chair');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).first().click();
  await expect(page.locator('.product-detail').getByRole('alert')).toContainText(
    'No changes were saved',
  );
  expect(await page.evaluate(() => localStorage.getItem('forme-field:browser-demo:v1'))).toBeNull();
});

test('corrupt data needs explicit reset; clearing storage updates another tab', async ({
  page,
  context,
}) => {
  await page.goto('/demo');
  await page.evaluate(() => localStorage.setItem('forme-field:browser-demo:v1', 'broken'));
  await page.reload();
  await expect(page.getByRole('alert').filter({ hasText: 'could not be read' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset my demo workspace' }).click();
  await page.getByRole('button', { name: 'Confirm reset of my workspace' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'could not be read' })).not.toBeVisible();
  await addCove(page);
  const other = await context.newPage();
  await other.goto('/cart');
  await expect(
    other
      .locator('.cart-page-items')
      .getByRole('link', { name: 'Cove lounge chair', exact: true })
      .first(),
  ).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await expect(
    other
      .locator('.cart-page-items')
      .getByRole('link', { name: 'Cove lounge chair', exact: true })
      .first(),
  ).not.toBeVisible();
});

test('shopping mutations send no commerce requests and survive a fresh page', async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' || r.url().includes('/api/')) requests.push(r.url());
  });
  await addCove(page);
  expect(requests).toEqual([]);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto('/cart');
  await expect(
    reopened
      .locator('.cart-page-items')
      .getByRole('link', { name: 'Cove lounge chair', exact: true })
      .first(),
  ).toBeVisible();
});
