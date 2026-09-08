'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Plus, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { money } from '@/lib/money';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
export function ProductCard({
  product: original,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const store = useStore();
  const p = store.data.products.find((p) => p.id === original.id) ?? original;
  const [quick, setQuick] = useState(false),
    [selected, setSelected] = useState(p.variants[0].id),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const v = p.variants.find((v) => v.id === selected) ?? p.variants[0],
    saved = store.wishlist.includes(p.id),
    price = Math.min(...p.variants.map((v) => v.price));
  async function wish() {
    try {
      await store.mutate({ action: 'wishlist', productId: p.id });
      store.notify(saved ? 'Piece removed from saved.' : 'Piece saved for later.');
    } catch (e) {
      store.notify((e as Error).message);
    }
  }
  async function add() {
    setBusy(true);
    setError('');
    try {
      await store.mutate({ action: 'cart', variantId: v.id, quantity: 1, mode: 'add' });
      setQuick(false);
      store.openCart();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (p.archived) return null;
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={`/products/${p.slug}`}>
          <Image
            src={p.images[0]}
            alt={`${p.name} in ${p.variants[0].name}`}
            fill
            sizes="(max-width: 600px) 48vw, (max-width: 1024px) 33vw, 25vw"
            preload={priority}
          />
        </Link>
        <button
          className={`icon-button save-button ${saved ? 'saved' : ''}`}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${p.name}`}
          aria-pressed={saved}
          disabled={!store.ready}
          onClick={wish}
        >
          <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button
          className="quick-add"
          onClick={() => setQuick(true)}
          aria-label={`Choose finish for ${p.name}`}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="product-name-row">
        <h3>
          <Link href={`/products/${p.slug}`}>{p.name}</Link>
        </h3>
        <span>
          {p.variants.some((v) => v.price !== price) && <span className="from-price">From </span>}
          {money(price)}
        </span>
      </div>
      <div className="product-material">
        <span>{p.material}</span>
        <span className="mini-swatches" role="img" aria-label={`${p.variants.length} finishes`}>
          {p.variants.map((v) => (
            <i key={v.id} style={{ background: v.color }} />
          ))}
        </span>
      </div>
      {p.variants.every((v) => v.stock === 0) && (
        <p className="availability-note">Currently unavailable</p>
      )}
      <Dialog open={quick} onClose={() => setQuick(false)} title={p.name}>
        <div className="quick-product">
          <Image src={p.images[0]} width={220} height={220} alt={p.name} />
          <p>{p.short}</p>
          <fieldset className="finish-options">
            <legend>Choose a finish</legend>
            {p.variants.map((x) => (
              <label key={x.id} className={`finish-choice ${x.id === v.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`quick-${p.id}`}
                  checked={v.id === x.id}
                  onChange={() => setSelected(x.id)}
                />
                <span className="swatch" style={{ background: x.color }} />
                <span>
                  {x.name}
                  {!x.stock && <small>Currently unavailable</small>}
                </span>
                <span>{money(x.price)}</span>
              </label>
            ))}
          </fieldset>
          <p className="small muted">
            Photography shows {p.variants[0].name.toLowerCase()}. Other finishes are represented by
            material colour swatches.
          </p>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <button
            className="button primary full"
            disabled={busy || !v.stock || !store.ready}
            onClick={add}
          >
            {busy ? 'Adding…' : v.stock ? 'Add to bag' : 'Currently unavailable'}
            <ArrowRight size={18} />
          </button>
          <Link
            className="text-link center"
            href={`/products/${p.slug}`}
            onClick={() => setQuick(false)}
          >
            Explore this piece
          </Link>
        </div>
      </Dialog>
    </article>
  );
}
