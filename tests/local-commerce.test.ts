import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAction,
  initialData,
  decode,
  getCart,
  localSchema,
  sampleAddress,
  type LocalData,
} from '../lib/local/store';
import { pricing } from '../lib/money';
const act = (d: LocalData, a: Record<string, unknown>) => applyAction(d, a).data;
const bag = () =>
  act(initialData(), { action: 'cart', variantId: 'v-1-1', quantity: 1, mode: 'add' });
const payment = (scenario = 'success', key = crypto.randomUUID()) => ({
  action: 'checkout',
  data: { key, scenario, delivery: 'standard', address: sampleAddress, expectedTotal: 96500 },
});
test('fresh catalogs are independent and survive versioned serialization', () => {
  const a = initialData(),
    b = initialData();
  a.products[0].variants[0].stock = 0;
  assert.equal(b.products.length, 24);
  assert.equal(b.products[0].variants[0].stock, 12);
  assert.deepEqual(decode(JSON.stringify(b)), b);
  assert.equal(decode(null).orders.length, 0);
  assert.throws(() => decode('{broken'), /could not be read/);
  assert.throws(() => decode('{"version":2}'), /could not be read/);
});
test('cart merges, stock and quantity validation leave original untouched', () => {
  const d = bag();
  const x = act(d, { action: 'cart', variantId: 'v-1-1', quantity: 2, mode: 'add' });
  assert.equal(getCart(x)[0].quantity, 3);
  assert.equal(getCart(d)[0].quantity, 1);
  for (const quantity of [0, -1, 1.5, 21, 13])
    assert.throws(() => act(d, { action: 'cart', variantId: 'v-1-1', quantity, mode: 'set' }));
  assert.throws(() => act(d, { action: 'cart', variantId: 'missing', quantity: 1, mode: 'add' }));
});
test('room add rolls back completely when one finish is unavailable', () => {
  const d = initialData();
  assert.throws(() =>
    act(d, {
      action: 'room',
      lines: [
        { variantId: 'v-1-1', quantity: 1 },
        { variantId: 'v-1-2', quantity: 1 },
      ],
    }),
  );
  assert.equal(d.cart.length, 0);
});
test('success saves snapshots, deducts once and retries return original order', () => {
  const d = bag(),
    p = payment();
  const { data, result } = applyAction(d, p);
  assert.equal(data.orders.length, 1);
  assert.equal(data.products[0].variants[0].stock, 11);
  assert.equal(data.cart.length, 0);
  assert.equal(data.outbox.length, 1);
  const retry = applyAction(data, p);
  assert.equal(retry.result.order?.id, result.order?.id);
  assert.equal(retry.data.orders.length, 1);
  assert.equal(retry.data.products[0].variants[0].stock, 11);
  data.products[0].name = 'Updated name';
  assert.equal(data.orders[0].lines[0].name, 'Cove lounge chair');
  assert.throws(
    () => applyAction(data, { ...p, data: { ...p.data, expectedTotal: 1 } }),
    /different order/,
  );
  localSchema.parse(data);
});
test('decline and duplicate decline preserve stock and bag', () => {
  const p = payment('decline'),
    one = applyAction(bag(), p),
    two = applyAction(one.data, p);
  assert.equal(two.result.declined, true);
  assert.equal(two.data.payments.length, 1);
  assert.equal(two.data.orders.length, 0);
  assert.equal(two.data.cart.length, 1);
  assert.equal(two.data.products[0].variants[0].stock, 12);
});
test('checkout rechecks totals, archive and delivery validation', () => {
  const d = bag(),
    p = payment();
  assert.throws(() => act(d, { ...p, data: { ...p.data, expectedTotal: 1 } }), /price changed/);
  d.products[0].archived = true;
  assert.throws(() => act(d, p), /Availability/);
  assert.throws(() => act(bag(), { ...p, data: { ...p.data, address: { name: 'A' } } }));
  assert.equal(pricing([{ price: 150000, quantity: 1 }]).shipping, 0);
  assert.equal(pricing([{ price: 149999, quantity: 1 }]).shipping, 7500);
});
test('cancel once restores stock after replenishment; shipped cannot cancel', () => {
  let d = act(bag(), payment());
  const id = d.orders[0].id;
  d.products[0].variants[0].stock = 100000;
  d = act(d, { action: 'order', id, status: 'cancelled', view: 'customer' });
  d = act(d, { action: 'order', id, status: 'cancelled', view: 'customer' });
  assert.equal(d.products[0].variants[0].stock, 100001);
  assert.equal(d.orders[0].refund, 'simulated-refunded');
  let other = act(act(bag(), payment()), { action: 'enter' });
  const otherId = other.orders[0].id;
  other = act(other, { action: 'order', id: otherId, status: 'processing', view: 'merchant' });
  other = act(other, { action: 'order', id: otherId, status: 'shipped', view: 'merchant' });
  assert.throws(() =>
    act(other, { action: 'order', id: otherId, status: 'cancelled', view: 'customer' }),
  );
});
test('unrelated browser order ids cannot resolve; merchant entry remains a demo gate', () => {
  const one = act(bag(), payment()),
    other = initialData();
  assert.throws(
    () =>
      act(other, { action: 'order', id: one.orders[0].id, status: 'cancelled', view: 'customer' }),
    /not found/,
  );
  assert.throws(
    () => act(other, { action: 'archive', id: 'p-01', archived: true }),
    /Enter your demo/,
  );
});
test('inquiries deduplicate and reset clears only the supplied snapshot', () => {
  const input = {
    action: 'inquiry',
    data: {
      name: 'Jamie Sample',
      email: 'jamie@example.com',
      topic: 'Product question',
      message: 'Would this chair fit a small reading room?',
    },
  };
  const first = applyAction(initialData(), input),
    second = applyAction(first.data, input);
  assert.equal(second.result.duplicate, true);
  assert.equal(second.data.inquiries.length, 1);
  assert.equal(second.data.outbox.length, 1);
  const reset = act(second.data, { action: 'reset', confirmation: 'RESET' });
  assert.equal(reset.inquiries.length, 0);
  assert.equal(second.data.inquiries.length, 1);
  assert.throws(() => act(second.data, { action: 'reset', confirmation: 'yes' }));
});
test('address changes stay local and update the profile', () => {
  let d = act(initialData(), { action: 'enter' });
  const id = d.addresses[0].id;
  d = act(d, { action: 'address', id, data: { ...sampleAddress, name: 'Jamie Sample' } });
  assert.equal(d.profile.name, 'Jamie Sample');
  assert.equal(d.addresses.length, 1);
  assert.throws(() => act(d, { action: 'address', id: 'foreign', data: sampleAddress }));
});
test('invalid persisted images and corrupted quantities are rejected', () => {
  const d = bag();
  d.products[0].images = ['https://untrusted.example/image.jpg'];
  assert.throws(() => decode(JSON.stringify(d)));
  const x = bag();
  x.cart[0].quantity = -1;
  assert.throws(() => decode(JSON.stringify(x)));
});
