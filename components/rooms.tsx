'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import type { Room, Product } from '@/lib/types';
import { money } from '@/lib/money';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
export function RoomScene({ room, products }: { room: Room; products: Product[] }) {
  const store = useStore(),
    [open, setOpen] = useState(false),
    [focused, setFocused] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [selection, setSelection] = useState<Record<string, string>>(
      Object.fromEntries(products.map((p) => [p.slug, p.variants[0].id])),
    ),
    [included, setIncluded] = useState(products.map((p) => p.slug));
  const shown = focused ? products.filter((p) => p.slug === focused) : products,
    chosen = products.filter((p) => included.includes(p.slug)),
    lines = chosen.map((p) => ({
      p,
      v: p.variants.find((v) => v.id === selection[p.slug])!,
      quantity: room.products.find((x) => x.slug === p.slug)?.quantity ?? 1,
    })),
    total = lines.reduce((n, l) => n + l.v.price * l.quantity, 0),
    available = lines.length > 0 && lines.every((l) => l.v.stock >= l.quantity);
  async function add() {
    setBusy(true);
    setError('');
    try {
      await store.mutate({
        action: 'room',
        lines: lines.map((l) => ({ variantId: l.v.id, quantity: l.quantity })),
      });
      setOpen(false);
      store.openCart();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="room-scene">
        <Image
          src={room.image}
          alt={`${room.subtitle}, featuring ${products.map((p) => p.name).join(', ')}`}
          fill
          sizes="100vw"
          preload
        />
        {room.products.map(
          (item) =>
            products.find((p) => p.slug === item.slug) && (
              <button
                className="hotspot"
                key={item.slug}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onClick={() => {
                  setFocused(item.slug);
                  setOpen(true);
                }}
                aria-label={`Explore ${products.find((p) => p.slug === item.slug)?.name}`}
              >
                <Plus size={18} />
              </button>
            ),
        )}
      </div>
      <div className="room-story">
        <div>
          <h2>{room.subtitle}</h2>
          <button
            className="button primary"
            style={{ marginTop: 25 }}
            onClick={() => {
              setFocused(null);
              setOpen(true);
            }}
          >
            Shop the room <ArrowRight size={18} />
          </button>
        </div>
        <div>
          {room.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={focused ? shown[0]?.name || 'Explore the room' : 'Make this room yours'}
      >
        <div className="shop-room-list">
          {focused ? (
            <>
              <Image src={shown[0].images[0]} width={450} height={450} alt={shown[0].name} />
              <p style={{ margin: '20px 0' }}>{shown[0].short}</p>
              <Link
                className="button primary full"
                href={`/products/${shown[0].slug}`}
                onClick={() => setOpen(false)}
              >
                Explore this piece <ArrowRight size={18} />
              </Link>
              <button className="text-link full center" onClick={() => setFocused(null)}>
                See all pieces in the room
              </button>
            </>
          ) : (
            <>
              <p className="small muted">
                Review finishes and quantities before adding. The room photographs show the first
                listed finishes; alternate finishes use swatches on each product page.
              </p>
              {products.map((p) => {
                const v = p.variants.find((v) => v.id === selection[p.slug])!,
                  quantity = room.products.find((x) => x.slug === p.slug)?.quantity ?? 1;
                return (
                  <div className="shop-room-item" key={p.id}>
                    <Image src={p.images[0]} width={70} height={70} alt={p.name} />
                    <div>
                      <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={included.includes(p.slug)}
                          onChange={(e) =>
                            setIncluded((prev) =>
                              e.target.checked
                                ? [...prev, p.slug]
                                : prev.filter((x) => x !== p.slug),
                            )
                          }
                        />
                        {quantity} × {p.name}
                      </label>
                      <select
                        aria-label={`Finish for ${p.name}`}
                        value={v.id}
                        onChange={(e) =>
                          setSelection((prev) => ({ ...prev, [p.slug]: e.target.value }))
                        }
                      >
                        {p.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} — {money(v.price)} {v.stock < quantity ? '(unavailable)' : ''}
                          </option>
                        ))}
                      </select>
                      <p className="small muted">
                        {v.stock >= quantity
                          ? `${v.stock} available`
                          : `Only ${v.stock} available; ${quantity} needed`}{' '}
                        · {money(v.price * quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="shop-room-total">
                <span>Pieces subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <p className="small muted" style={{ marginBottom: 20 }}>
                Delivery is calculated in your bag. Select a smaller set of pieces if you prefer.
              </p>
              {error && (
                <p className="error-text" role="alert">
                  {error}
                </p>
              )}
              <button className="button primary full" onClick={add} disabled={!available || busy}>
                {busy
                  ? 'Adding pieces…'
                  : available
                    ? 'Add selected pieces to bag'
                    : 'Adjust unavailable selections'}
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
