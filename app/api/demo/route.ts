import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { cookieName, session } from '@/lib/server/session';
import * as store from '@/lib/server/store';
import { isSameOrigin } from '@/lib/server/origin';
export const runtime = 'nodejs';
const inputSchema = z.discriminatedUnion('action', [
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
export async function POST(request: NextRequest) {
  if (
    !isSameOrigin(
      request.headers.get('origin'),
      request.headers.get('host'),
      process.env.NEXT_PUBLIC_SITE_URL,
    )
  )
    return NextResponse.json({ error: 'This request must come from the store.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json'))
    return NextResponse.json({ error: 'Use a JSON request.' }, { status: 415 });
  if (Number(request.headers.get('content-length') || 0) > 50000)
    return NextResponse.json({ error: 'This request is too large.' }, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 50000)
      return NextResponse.json({ error: 'This request is too large.' }, { status: 413 });
    const input = inputSchema.parse(JSON.parse(raw));
    let ws = await session();
    if (!ws) {
      if (!['enter', 'cart', 'room', 'wishlist', 'inquiry'].includes(input.action))
        return NextResponse.json(
          { error: 'Your session expired. Enter the demo again.' },
          { status: 401 },
        );
      const created = store.createWorkspace();
      (await cookies()).set(cookieName, created.token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 86400,
      });
      ws = store.resolveSession(created.token)!;
    }
    let result: unknown = {};
    const merchantActions = ['product', 'archive', 'inquiry-status'];
    if (
      (merchantActions.includes(input.action) ||
        (input.action === 'order' && input.view === 'merchant')) &&
      !ws.entered
    )
      return NextResponse.json(
        { error: 'Enter your demo account before using the merchant view.' },
        { status: 403 },
      );
    switch (input.action) {
      case 'enter':
        store.enterDemo(ws.id);
        break;
      case 'reset':
        store.resetWorkspace(ws.id);
        break;
      case 'cart':
        store.changeCart(ws.id, input.variantId, input.quantity ?? 1, input.mode);
        break;
      case 'room':
        store.addRoom(ws.id, input.lines);
        break;
      case 'wishlist':
        store.toggleWishlist(ws.id, input.productId);
        break;
      case 'checkout':
        result = store.checkout(ws.id, input.data);
        break;
      case 'order':
        result = {
          order: store.transitionOrder(ws.id, input.id, input.status, input.view === 'customer'),
        };
        break;
      case 'inquiry':
        result = store.submitInquiry(ws.id, input.data);
        break;
      case 'inquiry-status':
        store.updateInquiry(ws.id, input.id, input.status);
        break;
      case 'product':
        result = { id: store.saveProduct(ws.id, input.data) };
        break;
      case 'archive':
        store.archiveProduct(ws.id, input.id, input.archived);
        break;
      case 'address':
        store.saveAddress(ws.id, input.data, input.id);
        break;
    }
    return NextResponse.json(
      { result, state: store.state(ws.id) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(' '), fields: error.flatten() },
        { status: 400 },
      );
    const message = error instanceof Error ? error.message : 'Please try again.';
    if (message.includes('UNIQUE constraint'))
      return NextResponse.json(
        { error: 'That slug or SKU is already in use. Choose a unique value.' },
        { status: 409 },
      );
    if (message.includes('SQLITE') || message.includes('constraint failed')) {
      console.error(error);
      return NextResponse.json(
        { error: 'The change could not be saved. Check the values and try again.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
