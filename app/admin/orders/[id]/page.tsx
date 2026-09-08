import { notFound } from 'next/navigation';
import { session } from '@/lib/server/session';
import { getOrder } from '@/lib/server/store';
import { OrderView } from '@/components/order-view';
export const metadata = { title: 'Manage demo order' };
export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const ws = await session();
  if (!ws?.entered) notFound();
  const { id } = await params,
    order = getOrder(ws.id, id);
  if (!order) notFound();
  return <OrderView order={order} merchant />;
}
