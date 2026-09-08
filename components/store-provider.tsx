'use client';
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Trash2, Check } from 'lucide-react';
import type { StoreState, Order } from '@/lib/types';
import { money, pricing } from '@/lib/money';
import { Dialog } from './dialog';
import { shoppingState, type LocalData } from '@/lib/local/store';
import { subscribe, getSnapshot, getServerSnapshot, mutateBrowser } from '@/lib/local/browser';
type Result = { order?: Order; declined?: boolean; id?: string; duplicate?: boolean };
type StoreContext = StoreState & {
  data: LocalData;
  ready: boolean;
  storageError: string;
  mutate: (input: Record<string, unknown>) => Promise<Result>;
  openCart: () => void;
  closeCart: () => void;
  notify: (message: string) => void;
};
const Context = createContext<StoreContext | null>(null);
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error('Store provider missing.');
  return context;
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const current = shoppingState(snapshot.data);
  const [cartOpen, setCartOpen] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const mutate = mutateBrowser;
  async function update(variantId: string, quantity: number, mode: 'set' | 'remove') {
    setBusy(true);
    setError('');
    try {
      await mutate({ action: 'cart', variantId, quantity, mode });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const totals = pricing(current.cart);
  return (
    <Context.Provider
      value={{
        ...current,
        data: snapshot.data,
        ready: snapshot.ready,
        storageError: snapshot.error,
        mutate,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        notify: setNotice,
      }}
    >
      {snapshot.error && (
        <div className="demo-notice" role="alert">
          {snapshot.error} <Link href="/demo">Open demo settings</Link>
        </div>
      )}
      {children}
      <div className={`toast ${notice ? 'visible' : ''}`} role="status">
        {notice && (
          <>
            <Check size={17} />
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="Dismiss message">
              Dismiss
            </button>
          </>
        )}
      </div>
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title={`Your bag (${current.cart.reduce((n, l) => n + l.quantity, 0)})`}
        drawer
      >
        <div className="drawer-body">
          {current.cart.length ? (
            <>
              <p className="muted">Good pieces, ready for your space.</p>
              {error && (
                <p role="alert" className="error-text">
                  {error}
                </p>
              )}
              <div className="drawer-items">
                {current.cart.map((l) => (
                  <div className="bag-line" key={l.variantId}>
                    <Link
                      href={`/products/${l.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="bag-thumb"
                    >
                      <Image src={l.image} width={100} height={110} alt={l.name} />
                    </Link>
                    <div className="bag-info">
                      <Link href={`/products/${l.slug}`} onClick={() => setCartOpen(false)}>
                        {l.name}
                      </Link>
                      <p className="small muted">{l.variant}</p>
                      <div className="quantity-row">
                        <div className="quantity-control">
                          <button
                            disabled={busy || l.quantity <= 1}
                            onClick={() => update(l.variantId, l.quantity - 1, 'set')}
                            aria-label={`Decrease ${l.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{l.quantity}</span>
                          <button
                            disabled={busy || l.quantity >= Math.min(l.stock, 20)}
                            onClick={() => update(l.variantId, l.quantity + 1, 'set')}
                            aria-label={`Increase ${l.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          className="icon-button"
                          disabled={busy}
                          aria-label={`Remove ${l.name}`}
                          onClick={() => update(l.variantId, 1, 'remove')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {!l.available && (
                        <p className="error-text small">Availability changed. Adjust or remove.</p>
                      )}
                    </div>
                    <strong className="small">{money(l.price * l.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="bag-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(totals.subtotal)}</strong>
                </div>
                <p className="small muted">
                  {totals.subtotal >= 150000
                    ? 'Your pieces qualify for free standard delivery.'
                    : `${money(Math.max(0, 150000 - totals.subtotal))} from free standard delivery.`}
                </p>
                <Link
                  className="button primary full"
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                >
                  Continue to demo checkout <ArrowRight size={18} />
                </Link>
                <Link className="text-link center" href="/cart" onClick={() => setCartOpen(false)}>
                  View and edit bag
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>Make room for something good.</h3>
              <p>Your bag is waiting for a piece that feels right.</p>
              <Link href="/shop" className="button primary" onClick={() => setCartOpen(false)}>
                Explore the collection <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </Dialog>
    </Context.Provider>
  );
}
