import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { pricing } from '../lib/money';
const directory = mkdtempSync(join(tmpdir(), 'forme-field-test-'));
process.env.DATABASE_PATH = join(directory, 'test.sqlite');
const store = await import('../lib/server/store');
const { sqlite } = await import('../lib/db/connection');
const { addressSchema } = await import('../lib/validation');
after(() => {
  sqlite.close();
  rmSync(directory, { recursive: true, force: true });
});
function workspace() {
  return store.createWorkspace().id;
}
function input(ws: string, overrides: Record<string, unknown> = {}) {
  return {
    key: randomUUID(),
    delivery: 'standard',
    scenario: 'success',
    address: store.sampleAddress,
    expectedTotal: pricing(store.getCart(ws)).total,
    ...overrides,
  };
}
function first(ws: string) {
  return store.getProduct('cove-lounge-chair', ws)!.variants[0];
}
function productInput(p: ReturnType<typeof store.getProducts>[number]) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    short: p.short,
    description: p.description,
    material: p.material,
    ...p.dimensions,
    care: p.care,
    delivery: p.delivery,
    image: p.images[0],
    variants: p.variants.map((v) => ({ ...v })),
  };
}

test('integer cents, exact shipping boundaries, alternative delivery and invalid values', () => {
  assert.deepEqual(pricing([{ price: 149999, quantity: 1 }]), {
    subtotal: 149999,
    shipping: 7500,
    tax: 0,
    total: 157499,
  });
  assert.equal(pricing([{ price: 150000, quantity: 1 }]).shipping, 0);
  assert.equal(pricing([{ price: 150001, quantity: 1 }]).shipping, 0);
  assert.equal(pricing([{ price: 75000, quantity: 2 }]).shipping, 0);
  assert.equal(pricing([{ price: 200000, quantity: 1 }], 'white-glove').shipping, 15000);
  assert.equal(pricing([]).total, 0);
  for (const quantity of [-1, 0, 1.5, 21, NaN, Infinity])
    assert.throws(() => pricing([{ price: 100, quantity }]));
  for (const price of [-1, 1.5, NaN, Infinity])
    assert.throws(() => pricing([{ price, quantity: 1 }]));
});
test('invalid addresses fail the shared schema', () => {
  assert.equal(
    addressSchema.safeParse({ ...store.sampleAddress, email: 'invalid', name: '' }).success,
    false,
  );
});
test('rerunnable seed preserves workspace catalog edits and 24 distinct products', () => {
  const ws = workspace(),
    v = first(ws);
  sqlite.prepare('UPDATE variants SET stock=5 WHERE workspace=? AND id=?').run(ws, v.id);
  store.seed();
  assert.equal(first(ws).stock, 5);
  assert.equal(store.getProducts(ws).length, 24);
  assert.equal(new Set(store.getProducts(ws).map((p) => p.slug)).size, 24);
});
test('cart merges variants, validates quantity and preserves independent visitor data', () => {
  const a = workspace(),
    b = workspace(),
    v = first(a);
  store.changeCart(a, v.id, 1, 'add');
  store.changeCart(a, v.id, 2, 'add');
  assert.equal(store.getCart(a)[0].quantity, 3);
  assert.equal(store.getCart(b).length, 0);
  for (const q of [0, -1, 1.1, 21]) assert.throws(() => store.changeCart(a, v.id, q, 'set'));
  assert.throws(() => store.changeCart(a, v.id, 20, 'set'));
  store.toggleWishlist(a, 'p-01');
  assert.deepEqual(store.state(a).wishlist, ['p-01']);
  assert.deepEqual(store.state(b).wishlist, []);
});
test('successful simulator is persisted with exact totals, stock deduction and outbox', () => {
  const ws = workspace(),
    v = first(ws);
  store.changeCart(ws, v.id, 2, 'add');
  const result = store.checkout(ws, input(ws));
  assert.ok(result.order);
  assert.equal(result.order.total, 178000);
  assert.equal(first(ws).stock, v.stock - 2);
  assert.equal(store.getCart(ws).length, 0);
  assert.equal(store.listOrders(ws).length, 1);
  assert.equal(store.adminData(ws).outbox.length, 1);
  assert.equal(result.order.lines[0].sku, v.sku);
});
test('decline changes neither stock nor paid orders and repeated decline is idempotent', () => {
  const ws = workspace(),
    v = first(ws);
  store.changeCart(ws, v.id, 1, 'add');
  const data = input(ws, { scenario: 'decline' });
  assert.equal(store.checkout(ws, data).declined, true);
  assert.equal(store.checkout(ws, data).declined, true);
  assert.equal(first(ws).stock, v.stock);
  assert.equal(store.listOrders(ws).length, 0);
  assert.equal(store.getCart(ws).length, 1);
  assert.equal(store.adminData(ws).outbox.length, 0);
});
test('duplicate successful submission returns same order and does not deduct twice', () => {
  const ws = workspace(),
    v = first(ws);
  store.changeCart(ws, v.id, 1, 'add');
  const data = input(ws),
    a = store.checkout(ws, data),
    b = store.checkout(ws, data);
  assert.equal(a.order?.id, b.order?.id);
  assert.equal(first(ws).stock, v.stock - 1);
  assert.equal(store.listOrders(ws).length, 1);
  assert.throws(() => store.checkout(ws, { ...data, delivery: 'white-glove' }), /already used/);
});
test('price revalidation rejects tampered totals and archives cannot be checked out', () => {
  const ws = workspace(),
    v = first(ws);
  store.changeCart(ws, v.id, 1, 'add');
  assert.throws(() => store.checkout(ws, input(ws, { expectedTotal: 1 })), /price changed/);
  assert.equal(first(ws).stock, v.stock);
  store.archiveProduct(ws, 'p-01', true);
  assert.throws(() => store.checkout(ws, input(ws)), /Availability changed/);
  assert.equal(store.listOrders(ws).length, 0);
});
test('immutable order snapshots survive catalog description and price changes', () => {
  const ws = workspace(),
    v = first(ws);
  store.changeCart(ws, v.id, 1, 'add');
  const o = store.checkout(ws, input(ws)).order!;
  const p = productInput(store.getProduct('cove-lounge-chair', ws)!);
  p.name = 'Edited chair';
  p.variants[0].price = 12345;
  store.saveProduct(ws, p);
  const saved = store.getOrder(ws, o.id)!;
  assert.equal(saved.lines[0].name, 'Cove lounge chair');
  assert.equal(saved.lines[0].price, 89000);
  assert.equal(saved.total, 96500);
});
test('cancellation restores stock once with simulated refund; shipped cannot cancel', () => {
  const ws = workspace(),
    v = first(ws);
  store.changeCart(ws, v.id, 1, 'add');
  const o = store.checkout(ws, input(ws)).order!;
  store.transitionOrder(ws, o.id, 'processing');
  store.transitionOrder(ws, o.id, 'cancelled', true);
  store.transitionOrder(ws, o.id, 'cancelled', true);
  assert.equal(first(ws).stock, v.stock);
  assert.equal(store.getOrder(ws, o.id)?.refund, 'simulated-refunded');
  assert.throws(() => store.transitionOrder(ws, o.id, 'paid'));
  store.changeCart(ws, v.id, 1, 'add');
  const shipped = store.checkout(ws, input(ws)).order!;
  assert.throws(() => store.transitionOrder(ws, shipped.id, 'shipped'));
  store.transitionOrder(ws, shipped.id, 'processing');
  store.transitionOrder(ws, shipped.id, 'shipped');
  assert.throws(() => store.transitionOrder(ws, shipped.id, 'cancelled', true));
  store.transitionOrder(ws, shipped.id, 'delivered');
  assert.equal(first(ws).stock, v.stock - 1);
});
test('ownership protects order reads/mutations, inquiry updates and address changes', () => {
  const a = workspace(),
    b = workspace();
  store.changeCart(a, first(a).id, 1, 'add');
  const o = store.checkout(a, input(a)).order!;
  assert.equal(store.getOrder(b, o.id), null);
  assert.throws(() => store.transitionOrder(b, o.id, 'cancelled'), /not found/);
  const inquiry = store.submitInquiry(a, {
    name: 'Demo Person',
    email: 'demo@example.com',
    topic: 'Product question',
    message: 'A private workspace inquiry.',
  });
  assert.throws(() => store.updateInquiry(b, inquiry.id, 'resolved'), /not found/);
  store.saveAddress(a, store.sampleAddress);
  const address = store.accountData(a).addresses[0];
  assert.throws(() => store.saveAddress(b, store.sampleAddress, address.id), /not found/);
  assert.equal(store.adminData(b).outbox.length, 0);
});
test('inquiry duplicate is stored once and reset touches only its owner', () => {
  const a = workspace(),
    b = workspace(),
    message = {
      name: 'Demo Person',
      email: 'demo@example.com',
      topic: 'Trade inquiry',
      message: 'We are considering the dining room.',
    };
  const first = store.submitInquiry(a, message),
    second = store.submitInquiry(a, message);
  assert.equal(first.id, second.id);
  assert.equal(second.duplicate, true);
  store.changeCart(b, 'v-1-1', 2, 'add');
  store.toggleWishlist(b, 'p-01');
  store.resetWorkspace(a);
  assert.equal(store.adminData(a).inquiries.length, 0);
  assert.equal(store.adminData(a).outbox.length, 0);
  assert.equal(store.getProducts(a).length, 24);
  assert.equal(store.getCart(b)[0].quantity, 2);
  assert.deepEqual(store.state(b).wishlist, ['p-01']);
});
test('room add is atomic and rolls back the earlier line on an unavailable finish', () => {
  const ws = workspace();
  assert.throws(() =>
    store.addRoom(ws, [
      { variantId: 'v-2-1', quantity: 1 },
      { variantId: 'v-1-2', quantity: 1 },
    ]),
  );
  assert.equal(store.getCart(ws).length, 0);
});
test('unknown variants, cross-product variant writes, and invalid asset sources fail', () => {
  const ws = workspace();
  assert.throws(() => store.changeCart(ws, 'made-up-variant', 1, 'add'));
  const data = productInput(store.getProducts(ws)[0]);
  data.variants[0].id = 'v-2-1';
  assert.throws(() => store.saveProduct(ws, data), /does not belong/);
  const p = productInput(store.getProducts(ws)[0]);
  p.image = 'https://example.com/untrusted.png';
  assert.throws(() => store.saveProduct(ws, p), /asset library/);
});
test('opaque session hashes, expiration rejection and cleanup', () => {
  const created = store.createWorkspace();
  assert.equal(store.resolveSession(created.token)?.id, created.id);
  assert.equal(store.resolveSession('forged'), null);
  const row = sqlite.prepare('SELECT hash FROM sessions WHERE workspace=?').get(created.id) as {
    hash: string;
  };
  assert.notEqual(row.hash, created.token);
  sqlite
    .prepare('UPDATE sessions SET expires_at=? WHERE workspace=?')
    .run('2000-01-01', created.id);
  sqlite.prepare('UPDATE workspaces SET expires_at=? WHERE id=?').run('2000-01-01', created.id);
  assert.equal(store.resolveSession(created.token), null);
  assert.throws(() => store.requireWorkspace(created.id), /expired/);
  assert.ok(store.cleanup() >= 1);
});
test('two simultaneous database connections competing for final stock create one paid order', async () => {
  const ws = workspace();
  sqlite.prepare('UPDATE variants SET stock=1 WHERE workspace=? AND id=?').run(ws, 'v-1-1');
  store.changeCart(ws, 'v-1-1', 1, 'add');
  const attempt = input(ws);
  function run(key: string) {
    return new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, ['--import', 'tsx', 'scripts/race-worker.ts'], {
        cwd: process.cwd(),
        env: { ...process.env, FF_TEST_WS: ws, FF_TEST_INPUT: JSON.stringify({ ...attempt, key }) },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let out = '';
      child.stdout.on('data', (d) => (out += d));
      child.stderr.on('data', () => {});
      child.on('error', reject);
      child.on('exit', () => resolve(out.trim()));
    });
  }
  const results = await Promise.all([run(randomUUID()), run(randomUUID())]);
  assert.equal(results.filter((s) => s === 'paid').length, 1, JSON.stringify(results));
  assert.equal(store.listOrders(ws).length, 1);
  assert.equal(first(ws).stock, 0);
});
test('repeated and malformed search query values normalize safely', async () => {
  const { normalizeFilters } = await import('../lib/filters');
  assert.deepEqual(
    normalizeFilters({
      q: ['oak', 'linen'],
      min: 'NaN',
      max: '-1',
      category: ['Seating', 'Tables'],
    }),
    { q: 'oak', category: 'Seating' },
  );
  assert.equal(normalizeFilters({ q: 'x'.repeat(400) }).q?.length, 200);
});
test('public-origin verification rejects CSRF and supports the local bind address', async () => {
  const { isSameOrigin } = await import('../lib/server/origin');
  assert.equal(isSameOrigin('http://localhost:3000', 'localhost:3000'), true);
  assert.equal(isSameOrigin('https://untrusted.example', 'localhost:3000'), false);
  assert.equal(isSameOrigin(null, 'localhost:3000'), false);
  assert.equal(isSameOrigin('null', 'localhost:3000'), false);
  assert.equal(
    isSameOrigin('https://store.example', 'store.example', 'https://store.example'),
    true,
  );
  assert.equal(
    isSameOrigin('http://store.example', 'store.example', 'https://store.example'),
    false,
  );
});

test('cancellation restores stock after a merchant replenishes to the editing ceiling', () => {
  const ws = workspace();
  store.changeCart(ws, 'v-1-1', 1, 'add');
  const order = store.checkout(ws, input(ws)).order!;
  const p = productInput(store.getProduct('cove-lounge-chair', ws)!);
  p.variants[0].stock = 100000;
  store.saveProduct(ws, p);
  store.transitionOrder(ws, order.id, 'cancelled');
  assert.equal(first(ws).stock, 100001);
  store.transitionOrder(ws, order.id, 'cancelled');
  assert.equal(first(ws).stock, 100001);
  assert.deepEqual(sqlite.pragma('foreign_key_check'), []);
});
