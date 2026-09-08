'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from './store-provider';
import { pricing, money } from '@/lib/money';
export function Cart() {
  const store = useStore(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    totals = pricing(store.cart);
  async function change(id: string, quantity: number, mode: 'set' | 'remove') {
    setBusy(true);
    setError('');
    try {
      await store.mutate({ action: 'cart', variantId: id, quantity, mode });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!store.cart.length)
    return (
      <div className="empty-state">
        <h2>A good place to begin.</h2>
        <p>Your bag is empty. Find a piece that brings something useful to your everyday.</p>
        <Link href="/shop" className="button primary">
          Explore the collection <ArrowRight size={18} />
        </Link>
      </div>
    );
  return (
    <div className="commerce-layout">
      <div className="cart-page-items">
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        {store.cart.map((l) => (
          <div className="bag-line" key={l.variantId}>
            <Link className="bag-thumb" href={`/products/${l.slug}`}>
              <Image src={l.image} width={150} height={150} alt={l.name} />
            </Link>
            <div className="bag-info">
              <Link href={`/products/${l.slug}`}>{l.name}</Link>
              <p className="small muted">{l.variant}</p>
              <p className="small">{money(l.price)} each</p>
              <div className="quantity-row">
                <div className="quantity-control">
                  <button
                    disabled={busy || l.quantity <= 1}
                    onClick={() => change(l.variantId, l.quantity - 1, 'set')}
                    aria-label={`Decrease ${l.name}`}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{l.quantity}</span>
                  <button
                    disabled={busy || l.quantity >= Math.min(l.stock, 20)}
                    onClick={() => change(l.variantId, l.quantity + 1, 'set')}
                    aria-label={`Increase ${l.name}`}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="icon-button"
                  onClick={() => change(l.variantId, 1, 'remove')}
                  disabled={busy}
                  aria-label={`Remove ${l.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
              {!l.available && (
                <p className="error-text">
                  This quantity is no longer available. Adjust or remove the piece.
                </p>
              )}
            </div>
            <strong>{money(l.price * l.quantity)}</strong>
          </div>
        ))}
        <Link className="text-link" style={{ marginTop: 25 }} href="/shop">
          Continue exploring <ArrowRight size={18} />
        </Link>
      </div>
      <aside className="order-summary">
        <h2>A few good pieces.</h2>
        <div className="totals">
          <div>
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          <div>
            <span>Standard delivery</span>
            <span>{totals.shipping ? money(totals.shipping) : 'Complimentary'}</span>
          </div>
          <div className="grand-total">
            <span>Estimated total</span>
            <span>{money(totals.total)}</span>
          </div>
        </div>
        <p className="small muted">
          {totals.subtotal >= 150000
            ? 'Your bag qualifies for complimentary standard delivery.'
            : `Add ${money(150000 - totals.subtotal)} in pieces for complimentary standard delivery.`}{' '}
          White glove delivery can be selected at checkout.
        </p>
        {store.cart.every((l) => l.available) ? (
          <Link href="/checkout" className="button primary full">
            Continue to demo checkout <ArrowRight size={18} />
          </Link>
        ) : (
          <p className="error-text">Review unavailable items before checkout.</p>
        )}
        <p className="small muted">
          All prices include any applicable demo tax. No real payment is collected.
        </p>
      </aside>
    </div>
  );
}
