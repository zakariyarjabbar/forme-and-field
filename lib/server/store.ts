import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { and, eq, lt, desc } from 'drizzle-orm';
import { db, sqlite } from '../db/connection';
import * as t from '../db/schema';
import { seedProducts } from '../content/catalog';
import { pricing, money } from '../money';
import { simulator } from './payments';
import {
  checkoutSchema,
  inquirySchema,
  productSchema,
  quantitySchema,
  addressSchema,
} from '../validation';
import type { Product, Order, CartLine, OrderStatus, Address } from '../types';
const now = () => new Date().toISOString();
export const DEFAULT = '__catalog__';
export const sampleAddress: Address = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  line1: '24 Example Lane',
  line2: 'Apartment 2',
  city: 'Portland',
  region: 'Oregon',
  postal: '97201',
  country: 'United States',
};
export const hash = (input: string) => createHash('sha256').update(input).digest('hex');
export function audit(ws: string, message: string) {
  db.insert(t.activity)
    .values({ id: randomUUID(), workspace: ws, message, createdAt: now() })
    .run();
}
function seedCatalog(ws: string) {
  for (const p of seedProducts) {
    const { variants, ...data } = p;
    const insert = db
      .insert(t.products)
      .values({ workspace: ws, id: p.id, slug: p.slug, data, archived: false });
    if (ws === DEFAULT)
      insert
        .onConflictDoUpdate({
          target: [t.products.workspace, t.products.id],
          set: { data, slug: p.slug },
        })
        .run();
    else insert.onConflictDoNothing().run();
    for (const v of variants)
      db.insert(t.variants)
        .values({ ...v, workspace: ws, productId: p.id })
        .onConflictDoNothing()
        .run();
  }
}
export function seed() {
  sqlite.transaction(() => {
    db.insert(t.workspaces)
      .values({ id: DEFAULT, createdAt: now(), profile: sampleAddress })
      .onConflictDoNothing()
      .run();
    seedCatalog(DEFAULT);
  })();
}
seed();
export function cleanup() {
  return db.delete(t.workspaces).where(lt(t.workspaces.expiresAt, now())).run().changes;
}
export function createWorkspace() {
  return sqlite
    .transaction(() => {
      cleanup();
      const id = randomUUID(),
        token = randomBytes(32).toString('base64url'),
        expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      db.insert(t.workspaces)
        .values({ id, createdAt: now(), expiresAt, profile: sampleAddress })
        .run();
      db.insert(t.sessions)
        .values({ hash: hash(token), workspace: id, expiresAt })
        .run();
      seedCatalog(id);
      return { id, token, expiresAt };
    })
    .immediate();
}
export function resolveSession(token?: string) {
  if (!token || token.length > 100) return null;
  const s = db
    .select()
    .from(t.sessions)
    .where(eq(t.sessions.hash, hash(token)))
    .get();
  if (!s || s.expiresAt <= now()) return null;
  return db.select().from(t.workspaces).where(eq(t.workspaces.id, s.workspace)).get() ?? null;
}
export function requireWorkspace(ws: string) {
  const row = db.select().from(t.workspaces).where(eq(t.workspaces.id, ws)).get();
  if (!row || ws === DEFAULT || !row.expiresAt || row.expiresAt <= now())
    throw new Error('Your demo session expired. Enter a new demo workspace.');
  return row;
}
export function getProducts(ws = DEFAULT, includeArchived = false): Product[] {
  const rows = db.select().from(t.products).where(eq(t.products.workspace, ws)).all();
  const vars = db.select().from(t.variants).where(eq(t.variants.workspace, ws)).all();
  return rows
    .filter((r) => includeArchived || !r.archived)
    .map((r) => ({
      ...r.data,
      archived: r.archived,
      variants: vars
        .filter((v) => v.productId === r.id)
        .map(({ workspace: _workspace, productId: _productId, ...v }) => {
          void _workspace;
          void _productId;
          return v;
        }),
    }));
}
export function getProduct(slug: string, ws = DEFAULT) {
  return getProducts(ws).find((p) => p.slug === slug);
}
export function getCart(ws: string): CartLine[] {
  requireWorkspace(ws);
  const products = getProducts(ws, true);
  return db
    .select()
    .from(t.cartItems)
    .where(eq(t.cartItems.workspace, ws))
    .all()
    .flatMap((item) => {
      const p = products.find((p) => p.variants.some((v) => v.id === item.variantId));
      const v = p?.variants.find((v) => v.id === item.variantId);
      return p && v
        ? [
            {
              variantId: v.id,
              productId: p.id,
              slug: p.slug,
              name: p.name,
              image: v.image,
              variant: v.name,
              sku: v.sku,
              price: v.price,
              quantity: item.quantity,
              stock: v.stock,
              available: !p.archived && v.stock >= item.quantity,
            },
          ]
        : [];
    });
}
export function state(ws?: string) {
  if (!ws) return { cart: [], wishlist: [], hasWorkspace: false, entered: false };
  const w = requireWorkspace(ws);
  return {
    cart: getCart(ws),
    wishlist: db
      .select()
      .from(t.wishlist)
      .where(eq(t.wishlist.workspace, ws))
      .all()
      .map((x) => x.productId),
    hasWorkspace: true,
    entered: w.entered,
  };
}
export function changeCart(
  ws: string,
  variantId: string,
  quantity: number,
  mode: 'add' | 'set' | 'remove',
) {
  requireWorkspace(ws);
  return sqlite
    .transaction(() => {
      if (mode === 'remove') {
        db.delete(t.cartItems)
          .where(and(eq(t.cartItems.workspace, ws), eq(t.cartItems.variantId, variantId)))
          .run();
        return;
      }
      quantitySchema.parse(quantity);
      const p = getProducts(ws).find((p) => p.variants.some((v) => v.id === variantId));
      const v = p?.variants.find((v) => v.id === variantId);
      if (!v) throw new Error('This piece is no longer available. Remove it or choose another.');
      const previous = db
        .select()
        .from(t.cartItems)
        .where(and(eq(t.cartItems.workspace, ws), eq(t.cartItems.variantId, variantId)))
        .get();
      const next = mode === 'add' ? quantity + (previous?.quantity ?? 0) : quantity;
      quantitySchema.parse(next);
      if (v.stock < next)
        throw new Error(`Only ${v.stock} of this finish are available in your demo.`);
      db.insert(t.cartItems)
        .values({ workspace: ws, variantId, quantity: next })
        .onConflictDoUpdate({
          target: [t.cartItems.workspace, t.cartItems.variantId],
          set: { quantity: next },
        })
        .run();
    })
    .immediate();
}
export function addRoom(ws: string, lines: { variantId: string; quantity: number }[]) {
  requireWorkspace(ws);
  if (!lines.length || lines.length > 10) throw new Error('Choose at least one piece.');
  sqlite
    .transaction(() => {
      for (const l of lines) changeCart(ws, l.variantId, l.quantity, 'add');
    })
    .immediate();
}
export function toggleWishlist(ws: string, productId: string) {
  requireWorkspace(ws);
  if (!getProducts(ws).some((p) => p.id === productId))
    throw new Error('This piece is unavailable.');
  const clause = and(eq(t.wishlist.workspace, ws), eq(t.wishlist.productId, productId));
  if (db.select().from(t.wishlist).where(clause).get()) db.delete(t.wishlist).where(clause).run();
  else db.insert(t.wishlist).values({ workspace: ws, productId }).run();
}
export function enterDemo(ws: string) {
  requireWorkspace(ws);
  db.update(t.workspaces).set({ entered: true }).where(eq(t.workspaces.id, ws)).run();
  if (!db.select().from(t.addresses).where(eq(t.addresses.workspace, ws)).get())
    db.insert(t.addresses).values({ id: randomUUID(), workspace: ws, data: sampleAddress }).run();
}
export function resetWorkspace(ws: string) {
  requireWorkspace(ws);
  sqlite
    .transaction(() => {
      for (const table of [
        t.cartItems,
        t.wishlist,
        t.payments,
        t.orderItems,
        t.orders,
        t.inquiries,
        t.outbox,
        t.activity,
        t.addresses,
        t.variants,
        t.products,
      ])
        db.delete(table).where(eq(table.workspace, ws)).run();
      db.update(t.workspaces)
        .set({ profile: sampleAddress, entered: false })
        .where(eq(t.workspaces.id, ws))
        .run();
      seedCatalog(ws);
    })
    .immediate();
}
export function listOrders(ws: string): Order[] {
  requireWorkspace(ws);
  return db
    .select()
    .from(t.orders)
    .where(eq(t.orders.workspace, ws))
    .orderBy(desc(t.orders.createdAt))
    .all()
    .map((row) => ({
      ...row,
      lines: db
        .select()
        .from(t.orderItems)
        .where(and(eq(t.orderItems.workspace, ws), eq(t.orderItems.orderId, row.id)))
        .all()
        .map((x) => x.snapshot),
    }));
}
export function getOrder(ws: string, id: string) {
  return listOrders(ws).find((o) => o.id === id) ?? null;
}
function queueMessage(ws: string, recipient: string, subject: string, body: string) {
  db.insert(t.outbox)
    .values({ id: randomUUID(), workspace: ws, recipient, subject, body, createdAt: now() })
    .run();
}
export function checkout(ws: string, input: unknown) {
  requireWorkspace(ws);
  const data = checkoutSchema.parse(input);
  const inputHash = hash(JSON.stringify(data));
  return sqlite
    .transaction(() => {
      const previous = db
        .select()
        .from(t.payments)
        .where(and(eq(t.payments.workspace, ws), eq(t.payments.key, data.key)))
        .get();
      if (previous) {
        if (previous.inputHash !== inputHash)
          throw new Error(
            'This submission key was already used for a different order. Please review and try again.',
          );
        if (previous.status === 'declined') return { declined: true as const };
        const order = getOrder(ws, previous.orderId!);
        if (!order) throw new Error('Order not found.');
        return { order };
      }
      const lines = getCart(ws);
      if (!lines.length) throw new Error('Your bag is empty. Add a piece before checking out.');
      if (lines.some((l) => !l.available))
        throw new Error('Availability changed. Return to your bag and adjust the quantities.');
      const totals = pricing(lines, data.delivery);
      if (totals.total !== data.expectedTotal)
        throw new Error(
          'The price changed. Refresh your bag and review the new total before placing the order.',
        );
      const attempt = {
        id: randomUUID(),
        workspace: ws,
        key: data.key,
        inputHash,
        createdAt: now(),
      };
      if (simulator.decide(data.scenario).status === 'declined') {
        db.insert(t.payments)
          .values({ ...attempt, status: 'declined' })
          .run();
        audit(ws, 'Simulated payment declined; stock unchanged.');
        return { declined: true as const };
      }
      // The simulator decision, paid order, stock changes and outbox commit together.
      const id = randomUUID(),
        reference = `FF-${id.slice(0, 8).toUpperCase()}`;
      for (const line of lines) {
        const result = sqlite
          .prepare('UPDATE variants SET stock=stock-? WHERE workspace=? AND id=? AND stock>=?')
          .run(line.quantity, ws, line.variantId, line.quantity);
        if (result.changes !== 1)
          throw new Error('A piece just became unavailable. Review your bag.');
      }
      db.insert(t.orders)
        .values({
          id,
          workspace: ws,
          reference,
          status: 'paid',
          createdAt: now(),
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          total: totals.total,
          delivery: data.delivery,
          address: data.address,
        })
        .run();
      for (const line of lines)
        db.insert(t.orderItems)
          .values({ id: randomUUID(), orderId: id, workspace: ws, snapshot: line })
          .run();
      db.insert(t.payments)
        .values({ ...attempt, status: 'succeeded', orderId: id })
        .run();
      db.delete(t.cartItems).where(eq(t.cartItems.workspace, ws)).run();
      db.update(t.workspaces).set({ profile: data.address }).where(eq(t.workspaces.id, ws)).run();
      const existing = db.select().from(t.addresses).where(eq(t.addresses.workspace, ws)).all();
      if (!existing.some((a) => JSON.stringify(a.data) === JSON.stringify(data.address)))
        db.insert(t.addresses)
          .values({ id: randomUUID(), workspace: ws, data: data.address })
          .run();
      queueMessage(
        ws,
        data.address.email,
        `Your demo order ${reference}`,
        `Thank you, ${data.address.name}. Your simulated order ${reference} is recorded.\n\n${lines.map((l) => `${l.quantity} × ${l.name} — ${l.variant}: ${money(l.price * l.quantity)}`).join('\n')}\nDelivery: ${data.delivery}\nTotal: ${money(totals.total)}\n\nNo payment was collected. No products will be shipped. This message is a local preview; no email was sent.`,
      );
      audit(ws, `Demo order ${reference} paid (${money(totals.total)}).`);
      return { order: getOrder(ws, id)! };
    })
    .immediate();
}
export const transitions: Record<OrderStatus, OrderStatus[]> = {
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
export function transitionOrder(ws: string, id: string, next: OrderStatus, customer = false) {
  requireWorkspace(ws);
  return sqlite
    .transaction(() => {
      const order = getOrder(ws, id);
      if (!order) throw new Error('Order not found in this workspace.');
      if (customer && next !== 'cancelled')
        throw new Error('Customers can only cancel an unshipped order.');
      if (order.status === next) return order;
      if (!transitions[order.status].includes(next))
        throw new Error(`An order that is ${order.status} cannot become ${next}.`);
      if (next === 'cancelled') {
        for (const l of order.lines)
          sqlite
            .prepare('UPDATE variants SET stock=stock+? WHERE workspace=? AND id=?')
            .run(l.quantity, ws, l.variantId);
      }
      db.update(t.orders)
        .set({ status: next, refund: next === 'cancelled' ? 'simulated-refunded' : null })
        .where(and(eq(t.orders.workspace, ws), eq(t.orders.id, id)))
        .run();
      audit(
        ws,
        `${order.reference}: ${next}${next === 'cancelled' ? ' — stock restored; simulated refund recorded' : ''}.`,
      );
      return getOrder(ws, id)!;
    })
    .immediate();
}
export function submitInquiry(ws: string, input: unknown) {
  requireWorkspace(ws);
  const data = inquirySchema.parse(input),
    fingerprint = hash(JSON.stringify(data));
  return sqlite.transaction(() => {
    const existing = db
      .select()
      .from(t.inquiries)
      .where(and(eq(t.inquiries.workspace, ws), eq(t.inquiries.fingerprint, fingerprint)))
      .get();
    if (existing) return { id: existing.id, duplicate: true };
    const id = randomUUID();
    db.insert(t.inquiries)
      .values({ id, workspace: ws, ...data, fingerprint, createdAt: now() })
      .run();
    queueMessage(
      ws,
      data.email,
      'Your FORME & FIELD demo inquiry',
      `Hello ${data.name},\n\nYour inquiry about ${data.topic.toLowerCase()} is saved in this demo workspace.\n\n${data.message}\n\nThis is a local acknowledgment preview. No external message was sent.`,
    );
    audit(ws, `New ${data.topic.toLowerCase()} from ${data.name}.`);
    return { id, duplicate: false };
  })();
}
export function adminData(ws: string) {
  requireWorkspace(ws);
  return {
    orders: listOrders(ws),
    products: getProducts(ws, true),
    inquiries: db
      .select()
      .from(t.inquiries)
      .where(eq(t.inquiries.workspace, ws))
      .orderBy(desc(t.inquiries.createdAt))
      .all(),
    outbox: db
      .select()
      .from(t.outbox)
      .where(eq(t.outbox.workspace, ws))
      .orderBy(desc(t.outbox.createdAt))
      .all(),
    activity: db
      .select()
      .from(t.activity)
      .where(eq(t.activity.workspace, ws))
      .orderBy(desc(t.activity.createdAt))
      .limit(50)
      .all(),
  };
}
export function updateInquiry(ws: string, id: string, status: 'new' | 'resolved') {
  requireWorkspace(ws);
  const result = db
    .update(t.inquiries)
    .set({ status })
    .where(and(eq(t.inquiries.workspace, ws), eq(t.inquiries.id, id)))
    .run();
  if (!result.changes) throw new Error('Inquiry not found.');
  audit(ws, `Inquiry marked ${status}.`);
}
export const assetLibrary = seedProducts.map((p) => ({ image: p.images[0], name: p.name }));
export function saveProduct(ws: string, input: unknown) {
  requireWorkspace(ws);
  const data = productSchema.parse(input);
  if (!assetLibrary.some((a) => a.image === data.image))
    throw new Error('Choose a picture from the asset library.');
  return sqlite
    .transaction(() => {
      const original = data.id ? getProducts(ws, true).find((p) => p.id === data.id) : null;
      if (data.id && !original) throw new Error('Product not found.');
      const id = original?.id ?? randomUUID();
      const product: Product = {
        id,
        slug: data.slug,
        name: data.name,
        category: data.category,
        short: data.short,
        description: data.description,
        material: data.material,
        dimensions: { width: data.width, depth: data.depth, height: data.height },
        care: data.care,
        delivery: data.delivery,
        images: original && original.images[0] === data.image ? original.images : [data.image],
        featured: original?.featured ?? false,
        archived: original?.archived ?? false,
        related: original?.related ?? [],
        variants: [],
      };
      const { variants: unused, ...record } = product;
      void unused;
      db.insert(t.products)
        .values({ workspace: ws, id, slug: data.slug, data: record, archived: product.archived })
        .onConflictDoUpdate({
          target: [t.products.workspace, t.products.id],
          set: { slug: data.slug, data: record },
        })
        .run();
      const existing = original?.variants ?? [];
      for (const v of data.variants) {
        if (v.id && !existing.some((x) => x.id === v.id))
          throw new Error('Variant does not belong to this product.');
        const variantId = v.id ?? randomUUID();
        db.insert(t.variants)
          .values({
            ...v,
            id: variantId,
            workspace: ws,
            productId: id,
            finish: v.name,
            image: data.image,
          })
          .onConflictDoUpdate({
            target: [t.variants.workspace, t.variants.id],
            set: {
              sku: v.sku,
              name: v.name,
              finish: v.name,
              color: v.color,
              price: v.price,
              stock: v.stock,
              image: data.image,
            },
          })
          .run();
      }
      audit(ws, `${original ? 'Updated' : 'Created'} ${data.name}.`);
      return id;
    })
    .immediate();
}
export function archiveProduct(ws: string, id: string, archived: boolean) {
  requireWorkspace(ws);
  const result = db
    .update(t.products)
    .set({ archived })
    .where(and(eq(t.products.workspace, ws), eq(t.products.id, id)))
    .run();
  if (!result.changes) throw new Error('Product not found.');
  audit(ws, `Product ${archived ? 'archived' : 'restored'}.`);
}
export function accountData(ws: string) {
  const workspace = requireWorkspace(ws);
  return {
    profile: workspace.profile,
    entered: workspace.entered,
    orders: listOrders(ws),
    addresses: db.select().from(t.addresses).where(eq(t.addresses.workspace, ws)).all(),
  };
}
export function saveAddress(ws: string, input: unknown, id?: string) {
  requireWorkspace(ws);
  const data = addressSchema.parse(input);
  if (id) {
    const result = db
      .update(t.addresses)
      .set({ data })
      .where(and(eq(t.addresses.workspace, ws), eq(t.addresses.id, id)))
      .run();
    if (!result.changes) throw new Error('Address not found.');
  } else db.insert(t.addresses).values({ id: randomUUID(), workspace: ws, data }).run();
  db.update(t.workspaces).set({ profile: data }).where(eq(t.workspaces.id, ws)).run();
}
