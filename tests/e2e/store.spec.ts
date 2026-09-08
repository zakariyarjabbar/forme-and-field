import { test, expect, type Page, type BrowserContext } from '@playwright/test';
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
async function post(context: BrowserContext, data: Record<string, unknown>) {
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
  return context.request.post(`${base}/api/demo`, { headers: { Origin: base }, data });
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
  const state = await (await page.request.get('/api/state')).json();
  expect(state.cart[0].stock).toBe(12);
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

test('two visitors, duplicate payment retries, direct-object authorization, cancellation and scoped reset', async ({
  browser,
}) => {
  const a = await browser.newContext(),
    b = await browser.newContext();
  await post(a, { action: 'enter' });
  await post(b, { action: 'enter' });
  await post(a, { action: 'cart', variantId: 'v-1-1', quantity: 1, mode: 'add' });
  const payload = {
    action: 'checkout',
    data: {
      key: crypto.randomUUID(),
      delivery: 'standard',
      scenario: 'success',
      address,
      expectedTotal: 96500,
    },
  };
  const responses = await Promise.all([post(a, payload), post(a, payload)]);
  const bodies = await Promise.all(responses.map((r) => r.json()));
  expect(responses.map((r) => r.status())).toEqual([200, 200]);
  expect(bodies[0].result.order.id).toBe(bodies[1].result.order.id);
  const id = bodies[0].result.order.id;
  const foreign = await post(b, { action: 'order', id, status: 'cancelled', view: 'merchant' });
  expect(foreign.status()).toBe(400);
  const bPage = await b.newPage();
  for (const route of [
    `/account/orders/${id}`,
    `/checkout/confirmation/${id}`,
    `/admin/orders/${id}`,
  ]) {
    await bPage.goto(route);
    await expect(bPage.getByRole('heading', { name: 'This page has moved out.' })).toBeVisible();
    expect(await bPage.locator('body').innerText()).not.toContain(address.line1);
  }
  const aPage = await a.newPage();
  await aPage.goto(`/account/orders/${id}`);
  await aPage.getByRole('button', { name: 'Cancel demo order' }).click();
  await aPage.getByRole('button', { name: 'Confirm cancellation' }).click();
  await expect(aPage.locator('.status-badge')).toHaveText('cancelled');
  expect(
    (await (await post(a, { action: 'order', id, status: 'cancelled', view: 'customer' })).json())
      .result.order.refund,
  ).toBe('simulated-refunded');
  await post(b, { action: 'cart', variantId: 'v-2-1', quantity: 1, mode: 'add' });
  await aPage.goto('/demo');
  await aPage.getByRole('button', { name: 'Reset my demo workspace' }).click();
  await aPage.getByRole('button', { name: 'Confirm reset of my workspace' }).click();
  expect(
    (
      await (
        await b.request.get(`${process.env.TEST_BASE_URL || 'http://localhost:3000'}/api/state`)
      ).json()
    ).cart,
  ).toHaveLength(1);
  await aPage.goto(`/account/orders/${id}`);
  await expect(aPage.getByRole('heading', { name: 'This page has moved out.' })).toBeVisible();
  const cookie = (await a.cookies()).find((c) => c.name === 'ff_demo');
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Lax');
  const badOrigin = await a.request.post(
    `${process.env.TEST_BASE_URL || 'http://localhost:3000'}/api/demo`,
    {
      headers: { Origin: 'https://untrusted.example' },
      data: { action: 'reset', confirmation: 'RESET' },
    },
  );
  expect(badOrigin.status()).toBe(403);
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
  await post(page.context(), { action: 'enter' });
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
