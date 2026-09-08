import { NextResponse } from 'next/server';
import { session } from '@/lib/server/session';
import { state } from '@/lib/server/store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const ws = await session();
  return NextResponse.json(state(ws?.id), { headers: { 'Cache-Control': 'private, no-store' } });
}
