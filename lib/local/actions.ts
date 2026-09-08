import { z } from 'zod';
export const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('enter') }),
  z.object({ action: z.literal('reset'), confirmation: z.literal('RESET') }),
  z.object({
    action: z.literal('cart'),
    variantId: z.string().min(1).max(100),
    quantity: z.number().optional(),
    mode: z.enum(['add', 'set', 'remove']),
  }),
  z.object({
    action: z.literal('room'),
    lines: z
      .array(z.object({ variantId: z.string().max(100), quantity: z.number() }))
      .min(1)
      .max(10),
  }),
  z.object({ action: z.literal('wishlist'), productId: z.string().max(100) }),
  z.object({ action: z.literal('checkout'), data: z.unknown() }),
  z.object({
    action: z.literal('order'),
    id: z.string().max(100),
    status: z.enum(['paid', 'processing', 'shipped', 'delivered', 'cancelled']),
    view: z.enum(['customer', 'merchant']),
  }),
  z.object({ action: z.literal('inquiry'), data: z.unknown() }),
  z.object({
    action: z.literal('inquiry-status'),
    id: z.string().max(100),
    status: z.enum(['new', 'resolved']),
  }),
  z.object({ action: z.literal('product'), data: z.unknown() }),
  z.object({ action: z.literal('archive'), id: z.string().max(100), archived: z.boolean() }),
  z.object({ action: z.literal('address'), id: z.string().max(100).optional(), data: z.unknown() }),
]);
