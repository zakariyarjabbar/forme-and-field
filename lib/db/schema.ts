import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { Product, Address, CartLine, OrderStatus, DeliveryMethod } from '../types';
export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'),
  entered: integer('entered', { mode: 'boolean' }).notNull().default(false),
  profile: text('profile', { mode: 'json' }).$type<Address>().notNull(),
});
export const sessions = sqliteTable('sessions', {
  hash: text('hash').primaryKey(),
  workspace: text('workspace')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
});
export const products = sqliteTable(
  'products',
  {
    workspace: text('workspace')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    slug: text('slug').notNull(),
    data: text('data', { mode: 'json' }).$type<Omit<Product, 'variants'>>().notNull(),
    archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.workspace, t.id] }),
    uniqueIndex('product_slug').on(t.workspace, t.slug),
  ],
);
export const variants = sqliteTable(
  'variants',
  {
    workspace: text('workspace')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    productId: text('product_id').notNull(),
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    finish: text('finish').notNull(),
    color: text('color').notNull(),
    price: integer('price').notNull(),
    stock: integer('stock').notNull(),
    image: text('image').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.workspace, t.id] }),
    uniqueIndex('variant_sku').on(t.workspace, t.sku),
  ],
);
export const cartItems = sqliteTable(
  'cart_items',
  {
    workspace: text('workspace')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    variantId: text('variant_id').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (t) => [primaryKey({ columns: [t.workspace, t.variantId] })],
);
export const wishlist = sqliteTable(
  'wishlist',
  {
    workspace: text('workspace')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    productId: text('product_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.workspace, t.productId] })],
);
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  workspace: text('workspace')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  reference: text('reference').notNull(),
  createdAt: text('created_at').notNull(),
  status: text('status').$type<OrderStatus>().notNull(),
  subtotal: integer('subtotal').notNull(),
  shipping: integer('shipping').notNull(),
  total: integer('total').notNull(),
  delivery: text('delivery').$type<DeliveryMethod>().notNull(),
  address: text('address', { mode: 'json' }).$type<Address>().notNull(),
  refund: text('refund'),
});
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  workspace: text('workspace')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  snapshot: text('snapshot', { mode: 'json' }).$type<CartLine>().notNull(),
});
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    workspace: text('workspace')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    inputHash: text('input_hash').notNull(),
    status: text('status').notNull(),
    orderId: text('order_id'),
    createdAt: text('created_at').notNull(),
  },
  (t) => [uniqueIndex('payment_idempotency').on(t.workspace, t.key)],
);
export const inquiries = sqliteTable(
  'inquiries',
  {
    id: text('id').primaryKey(),
    workspace: text('workspace')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    topic: text('topic').notNull(),
    message: text('message').notNull(),
    status: text('status').notNull().default('new'),
    createdAt: text('created_at').notNull(),
    fingerprint: text('fingerprint').notNull(),
  },
  (t) => [uniqueIndex('inquiry_duplicate').on(t.workspace, t.fingerprint)],
);
export const outbox = sqliteTable('outbox', {
  id: text('id').primaryKey(),
  workspace: text('workspace')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
});
export const activity = sqliteTable('activity', {
  id: text('id').primaryKey(),
  workspace: text('workspace')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull(),
});
export const addresses = sqliteTable('addresses', {
  id: text('id').primaryKey(),
  workspace: text('workspace')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  data: text('data', { mode: 'json' }).$type<Address>().notNull(),
});
