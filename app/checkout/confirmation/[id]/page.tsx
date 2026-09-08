import { notFound } from 'next/navigation';
import { session } from '@/lib/server/session';
import { getOrder } from '@/lib/server/store';
import { OrderView } from '@/components/order-view';
export const metadata = { title: 'Your demo order' };
export default async function Confirmation({ params }: { params: Promise<{ id: string }> }) {
  const ws = await session();
  if (!ws) notFound();
  const { id } = await params,
    order = getOrder(ws.id, id);
  if (!order) notFound();
  return <OrderView order={order} confirmation />;
}
