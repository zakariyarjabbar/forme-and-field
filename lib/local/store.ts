import { z } from 'zod';
import { seedProducts } from '../content/catalog';
import { pricing, money } from '../money';
import {
  checkoutSchema,
  inquirySchema,
  productSchema,
  quantitySchema,
  addressSchema,
} from '../validation';
import { inputSchema } from './actions';
import type { Product, Order, CartLine, OrderStatus, Address, StoreState } from '../types';

export const STORAGE_KEY = 'forme-field:browser-demo:v1';
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
export const assetLibrary = seedProducts.map((p) => ({ image: p.images[0], name: p.name }));
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const statuses = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const imagePath = z
  .string()
  .refine((s) => seedProducts.some((p) => p.images.includes(s)), 'Choose a catalog image.');
const safeInt = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const variant = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  finish: z.string(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  price: safeInt,
  stock: safeInt,
  image: imagePath,
});
const product = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string(),
  category: z.enum(['Seating', 'Tables', 'Lighting', 'Storage', 'Objects']),
  short: z.string(),
  description: z.string(),
  material: z.string(),
  dimensions: z.object({
    width: z.number().positive(),
    depth: z.number().positive(),
    height: z.number().positive(),
  }),
  care: z.string(),
  delivery: z.string(),
  images: z.array(imagePath).min(1),
  featured: z.boolean(),
  archived: z.boolean(),
  variants: z.array(variant).min(1),
  related: z.array(z.string()),
});
const cartLine = z.object({
  variantId: z.string(),
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  image: imagePath,
  variant: z.string(),
  sku: z.string(),
  price: safeInt,
  quantity: quantitySchema,
  stock: safeInt,
  available: z.boolean(),
});
const order = z.object({
  id: z.string(),
  reference: z.string(),
  status: z.enum(statuses),
  createdAt: z.string(),
  subtotal: safeInt,
  shipping: safeInt,
  total: safeInt,
  delivery: z.enum(['standard', 'white-glove']),
  address: addressSchema,
  lines: z.array(cartLine),
  refund: z.string().nullable(),
});
export const localSchema = z.object({
  version: z.literal(1),
  revision: safeInt,
  entered: z.boolean(),
  hasWorkspace: z.boolean(),
  profile: addressSchema,
  products: z.array(product).min(1).max(500),
  cart: z.array(z.object({ variantId: z.string(), quantity: quantitySchema })),
  wishlist: z.array(z.string()),
  orders: z.array(order),
  addresses: z.array(z.object({ id: z.string(), data: addressSchema })),
  payments: z.array(
    z.object({
      key: z.string(),
      fingerprint: z.string(),
      declined: z.boolean(),
      orderId: z.string().optional(),
    }),
  ),
  inquiries: z.array(
    inquirySchema.extend({
      id: z.string(),
      fingerprint: z.string(),
      status: z.enum(['new', 'resolved']),
      createdAt: z.string(),
    }),
  ),
  outbox: z.array(
    z.object({
      id: z.string(),
      recipient: z.string(),
      subject: z.string(),
      body: z.string(),
      createdAt: z.string(),
    }),
  ),
  activity: z.array(z.object({ id: z.string(), message: z.string(), createdAt: z.string() })),
});
export type LocalData = z.infer<typeof localSchema>;
export type Result = { order?: Order; declined?: boolean; id?: string; duplicate?: boolean };
export function initialData(): LocalData {
  return {
    version: 1,
    revision: 0,
    entered: false,
    hasWorkspace: false,
    profile: { ...sampleAddress },
    products: structuredClone(seedProducts),
    cart: [],
    wishlist: [],
    orders: [],
    addresses: [],
    payments: [],
    inquiries: [],
    outbox: [],
    activity: [],
  };
}
export function decode(raw: string | null): LocalData {
  if (!raw) return initialData();
  try {
    return localSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      'Saved browser data could not be read. Reset this browser demo to start again.',
    );
  }
}
export function getCart(data: LocalData): CartLine[] {
  return data.cart.flatMap((item) => {
    const p = data.products.find((p) => p.variants.some((v) => v.id === item.variantId));
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
export function shoppingState(data: LocalData): StoreState {
  return {
    cart: getCart(data),
    wishlist: data.wishlist,
    hasWorkspace: data.hasWorkspace,
    entered: data.entered,
  };
}
export const transitions: Record<OrderStatus, OrderStatus[]> = {
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
function audit(d: LocalData, message: string) {
  d.activity.unshift({ id: id(), message, createdAt: now() });
  d.activity = d.activity.slice(0, 50);
}
function message(d: LocalData, recipient: string, subject: string, body: string) {
  d.outbox.unshift({ id: id(), recipient, subject, body, createdAt: now() });
}
function changeCart(
  d: LocalData,
  variantId: string,
  quantity: number,
  mode: 'add' | 'set' | 'remove',
) {
  if (mode === 'remove') {
    d.cart = d.cart.filter((l) => l.variantId !== variantId);
    return;
  }
  quantitySchema.parse(quantity);
  const p = d.products.find((p) => !p.archived && p.variants.some((v) => v.id === variantId));
  const v = p?.variants.find((v) => v.id === variantId);
  if (!v) throw new Error('This piece is no longer available. Remove it or choose another.');
  const old = d.cart.find((l) => l.variantId === variantId),
    next = mode === 'add' ? quantity + (old?.quantity ?? 0) : quantity;
  quantitySchema.parse(next);
  if (v.stock < next) throw new Error(`Only ${v.stock} of this finish are available in your demo.`);
  if (old) old.quantity = next;
  else d.cart.push({ variantId, quantity: next });
}
// Pure, copy-on-write operation: a failed action never partially mutates the saved snapshot.
export function applyAction(source: LocalData, raw: unknown): { data: LocalData; result: Result } {
  const input = inputSchema.parse(raw);
  const d = structuredClone(source);
  let result: Result = {};
  if (
    (['product', 'archive', 'inquiry-status'].includes(input.action) ||
      (input.action === 'order' && input.view === 'merchant')) &&
    !d.entered
  )
    throw new Error('Enter your demo account before using the merchant view.');
  d.hasWorkspace = true;
  switch (input.action) {
    case 'enter':
      d.entered = true;
      if (!d.addresses.length) d.addresses.push({ id: id(), data: { ...d.profile } });
      break;
    case 'reset':
      return { data: { ...initialData(), revision: d.revision + 1 }, result };
    case 'cart':
      changeCart(d, input.variantId, input.quantity ?? 1, input.mode);
      break;
    case 'room':
      for (const l of input.lines) changeCart(d, l.variantId, l.quantity, 'add');
      break;
    case 'wishlist':
      if (!d.products.some((p) => p.id === input.productId && !p.archived))
        throw new Error('This piece is unavailable.');
      d.wishlist = d.wishlist.includes(input.productId)
        ? d.wishlist.filter((p) => p !== input.productId)
        : [...d.wishlist, input.productId];
      break;
    case 'checkout': {
      const value = checkoutSchema.parse(input.data),
        fingerprint = JSON.stringify(value);
      const previous = d.payments.find((p) => p.key === value.key);
      if (previous) {
        if (previous.fingerprint !== fingerprint)
          throw new Error(
            'This submission key was used for a different order. Review and try again.',
          );
        const saved = d.orders.find((o) => o.id === previous.orderId);
        if (!previous.declined && !saved) throw new Error('Order not found in this browser.');
        result = previous.declined ? { declined: true } : { order: saved };
        break;
      }
      const lines = getCart(d);
      if (!lines.length) throw new Error('Your bag is empty. Add a piece before checking out.');
      if (lines.some((l) => !l.available))
        throw new Error('Availability changed. Return to your bag and adjust the quantities.');
      const totals = pricing(lines, value.delivery);
      if (totals.total !== value.expectedTotal)
        throw new Error(
          'The price changed. Refresh your bag and review the new total before placing the order.',
        );
      if (value.scenario === 'decline') {
        d.payments.push({ key: value.key, fingerprint, declined: true });
        audit(d, 'Simulated payment declined; stock unchanged.');
        result = { declined: true };
        break;
      }
      const orderId = id(),
        reference = `FF-${orderId.slice(0, 8).toUpperCase()}`;
      for (const l of lines) {
        const v = d.products.flatMap((p) => p.variants).find((v) => v.id === l.variantId)!;
        v.stock -= l.quantity;
      }
      const o: Order = {
        id: orderId,
        reference,
        status: 'paid',
        createdAt: now(),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        delivery: value.delivery,
        address: value.address,
        lines,
        refund: null,
      };
      d.orders.unshift(o);
      d.cart = [];
      d.profile = value.address;
      if (!d.addresses.some((a) => JSON.stringify(a.data) === JSON.stringify(value.address)))
        d.addresses.push({ id: id(), data: value.address });
      d.payments.push({ key: value.key, fingerprint, declined: false, orderId });
      message(
        d,
        value.address.email,
        `Your demo order ${reference}`,
        `Thank you, ${value.address.name}. Your simulated order ${reference} is saved in this browser.\n\n${lines.map((l) => `${l.quantity} × ${l.name} — ${l.variant}: ${money(l.price * l.quantity)}`).join('\n')}\nTotal: ${money(totals.total)}\n\nNo payment was collected. No products will be shipped. No email was sent.`,
      );
      audit(d, `Demo order ${reference} paid (${money(totals.total)}).`);
      result = { order: o };
      break;
    }
    case 'order': {
      const o = d.orders.find((o) => o.id === input.id);
      if (!o) throw new Error('Order not found in this browser.');
      if (input.view === 'customer' && input.status !== 'cancelled')
        throw new Error('Customers can only cancel an unshipped order.');
      if (o.status === input.status) {
        result = { order: o };
        break;
      }
      if (!transitions[o.status].includes(input.status))
        throw new Error(`An order that is ${o.status} cannot become ${input.status}.`);
      if (input.status === 'cancelled')
        for (const l of o.lines) {
          const v = d.products.flatMap((p) => p.variants).find((v) => v.id === l.variantId);
          if (v) v.stock += l.quantity;
        }
      o.status = input.status;
      o.refund = input.status === 'cancelled' ? 'simulated-refunded' : null;
      audit(d, `${o.reference}: ${input.status}.`);
      result = { order: o };
      break;
    }
    case 'inquiry': {
      const value = inquirySchema.parse(input.data),
        fingerprint = JSON.stringify(value),
        old = d.inquiries.find((i) => i.fingerprint === fingerprint);
      if (old) {
        result = { id: old.id, duplicate: true };
        break;
      }
      const inquiryId = id();
      d.inquiries.unshift({
        ...value,
        id: inquiryId,
        fingerprint,
        status: 'new',
        createdAt: now(),
      });
      message(
        d,
        value.email,
        'Your FORME & FIELD demo inquiry',
        `Hello ${value.name},\n\nYour inquiry is saved only in this browser.\n\n${value.message}\n\nNo external message was sent.`,
      );
      audit(d, `New ${value.topic.toLowerCase()} from ${value.name}.`);
      result = { id: inquiryId, duplicate: false };
      break;
    }
    case 'inquiry-status': {
      const i = d.inquiries.find((i) => i.id === input.id);
      if (!i) throw new Error('Inquiry not found.');
      i.status = input.status;
      audit(d, `Inquiry marked ${input.status}.`);
      break;
    }
    case 'product': {
      const value = productSchema.parse(input.data);
      if (!assetLibrary.some((a) => a.image === value.image))
        throw new Error('Choose a picture from the asset library.');
      const old = d.products.find((p) => p.id === value.id);
      if (value.id && !old) throw new Error('Product not found.');
      if (d.products.some((p) => p.id !== old?.id && p.slug === value.slug))
        throw new Error('That slug is already in use.');
      const variants = value.variants.map((v) => {
        if (v.id && !old?.variants.some((x) => x.id === v.id))
          throw new Error('Variant does not belong to this product.');
        return { ...v, id: v.id ?? id(), finish: v.name, image: value.image };
      });
      if (
        new Set(variants.map((v) => v.sku)).size !== variants.length ||
        new Set(variants.map((v) => v.id)).size !== variants.length ||
        d.products.some(
          (p) => p.id !== old?.id && p.variants.some((v) => variants.some((x) => x.sku === v.sku)),
        )
      )
        throw new Error('Use a unique SKU for each finish.');
      // Preserve historical variants so existing bags and cancellations still resolve.
      const removed = (old?.variants ?? []).filter((v) => !variants.some((x) => x.id === v.id));
      if (removed.length)
        throw new Error('Keep existing finishes; set stock to zero to make one unavailable.');
      const p: Product = {
        id: old?.id ?? id(),
        slug: value.slug,
        name: value.name,
        category: value.category,
        short: value.short,
        description: value.description,
        material: value.material,
        dimensions: { width: value.width, depth: value.depth, height: value.height },
        care: value.care,
        delivery: value.delivery,
        images: old?.images[0] === value.image ? old.images : [value.image],
        featured: old?.featured ?? false,
        archived: old?.archived ?? false,
        related: old?.related ?? [],
        variants,
      };
      if (old) d.products[d.products.indexOf(old)] = p;
      else {
        if (d.products.length >= 500)
          throw new Error('This browser demo holds up to 500 products.');
        d.products.push(p);
      }
      audit(d, `${old ? 'Updated' : 'Created'} ${p.name}.`);
      result = { id: p.id };
      break;
    }
    case 'archive': {
      const p = d.products.find((p) => p.id === input.id);
      if (!p) throw new Error('Product not found.');
      p.archived = input.archived;
      audit(d, `Product ${input.archived ? 'archived' : 'restored'}.`);
      break;
    }
    case 'address': {
      const value = addressSchema.parse(input.data);
      if (input.id) {
        const a = d.addresses.find((a) => a.id === input.id);
        if (!a) throw new Error('Address not found.');
        a.data = value;
      } else d.addresses.push({ id: id(), data: value });
      d.profile = value;
      break;
    }
  }
  d.revision++;
  return { data: d, result };
}
