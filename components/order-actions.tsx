'use client';
import { useState } from 'react';
import type { Order, OrderStatus } from '@/lib/types';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
const transitions: Record<OrderStatus, OrderStatus[]> = {
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
export function OrderActions({ order, merchant = false }: { order: Order; merchant?: boolean }) {
  const store = useStore(),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function change(status: OrderStatus) {
    setBusy(true);
    setError('');
    try {
      await store.mutate({
        action: 'order',
        id: order.id,
        status,
        view: merchant ? 'merchant' : 'customer',
      });
      setConfirm(false);
      store.notify(
        status === 'cancelled'
          ? 'Order cancelled. Stock restored and simulated refund recorded.'
          : `Demo order marked ${status}.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const allowed = transitions[order.status];
  return (
    <div style={{ marginTop: 25 }}>
      {merchant &&
        allowed
          .filter((s) => s !== 'cancelled')
          .map((s) => (
            <button className="button secondary" disabled={busy} key={s} onClick={() => change(s)}>
              Simulate {s}
            </button>
          ))}
      {allowed.includes('cancelled') && (
        <button
          className="text-link"
          style={{ marginLeft: merchant ? 20 : 0 }}
          disabled={busy}
          onClick={() => setConfirm(true)}
        >
          Cancel demo order
        </button>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Cancel this demo order?">
        <div className="inquiry-body">
          <p>
            This restores each purchased quantity once and records a simulated refund. No real
            payment or shipment is involved.
          </p>
          <button
            className="button primary full"
            disabled={busy}
            onClick={() => change('cancelled')}
          >
            {busy ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
          <button className="text-link full center" onClick={() => setConfirm(false)}>
            Keep the order
          </button>
        </div>
      </Dialog>
    </div>
  );
}
