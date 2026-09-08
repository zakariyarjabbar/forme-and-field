'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Minus, Plus, Expand } from 'lucide-react';
import type { Product } from '@/lib/types';
import { money } from '@/lib/money';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
export function ProductDetail({ product: p }: { product: Product }) {
  const store = useStore(),
    [selected, setSelected] = useState(p.variants[0].id),
    [quantity, setQuantity] = useState(1),
    [zoom, setZoom] = useState<number | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const purchaseRef = useRef<HTMLDivElement>(null),
    [sticky, setSticky] = useState(false);
  useEffect(() => {
    const target = purchaseRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) =>
      setSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const v = p.variants.find((v) => v.id === selected) ?? p.variants[0],
    saved = store.wishlist.includes(p.id);
  async function add() {
    setBusy(true);
    setError('');
    try {
      await store.mutate({ action: 'cart', variantId: v.id, quantity, mode: 'add' });
      store.openCart();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    try {
      await store.mutate({ action: 'wishlist', productId: p.id });
      store.notify(saved ? 'Piece removed from saved.' : 'Piece saved for later.');
    } catch (e) {
      store.notify((e as Error).message);
    }
  }
  return (
    <>
      <div className="product-detail">
        <div className="product-gallery">
          {p.images.map((src, i) => (
            <button
              className="gallery-image"
              key={src}
              onClick={() => setZoom(i)}
              aria-label={`Zoom ${i === 0 ? 'primary' : i === 1 ? 'alternate' : 'material detail'} view of ${p.name}`}
            >
              <Image
                src={src}
                alt={`${p.name}, ${i === 0 ? p.variants[0].name : i === 1 ? 'alternate view' : 'material and construction detail'}`}
                fill
                sizes={i === 0 ? '(max-width:800px) 100vw, 53vw' : '(max-width:800px) 50vw, 27vw'}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
              />
              <span>
                <Expand size={19} />
              </span>
            </button>
          ))}
        </div>
        <div className="purchase-panel">
          <div className="product-category">
            <Link href={`/shop?category=${p.category}`}>{p.category}</Link>
            <span>{p.material}</span>
          </div>
          <h1>{p.name}</h1>
          <div className="product-price">
            <span>{money(v.price)}</span>
            <span className="small">USD</span>
          </div>
          <p className="product-intro">{p.description}</p>
          <fieldset>
            <legend>Finish — {v.name}</legend>
            <div className="finish-select">
              {p.variants.map((x) => (
                <button
                  type="button"
                  key={x.id}
                  className={`finish-button ${x.id === v.id ? 'active' : ''}`}
                  aria-label={`${x.name}${!x.stock ? ', currently unavailable' : ''}`}
                  aria-pressed={x.id === v.id}
                  onClick={() => {
                    setSelected(x.id);
                    setQuantity(1);
                    setError('');
                  }}
                >
                  <span className="swatch" style={{ background: x.color }} />
                </button>
              ))}
            </div>
            <p className="finish-note">
              {v.id === p.variants[0].id
                ? 'Shown in the selected finish.'
                : `Finish swatch shown above. Photography shows ${p.variants[0].name.toLowerCase()}; an exact photograph of this finish is not available.`}
            </p>
          </fieldset>
          <div className="stock-state" aria-live="polite">
            <span className={`stock-dot ${!v.stock ? 'unavailable' : ''}`} />
            {v.stock
              ? v.stock <= 3
                ? `${v.stock} available in your demo`
                : 'In stock in your demo'
              : 'Currently unavailable in this finish'}
          </div>
          {v.stock > 0 && (
            <p className="small muted" style={{ marginTop: 5 }}>
              {p.delivery}
            </p>
          )}
          <div className="purchase-actions" ref={purchaseRef}>
            <div className="quantity-control">
              <button
                disabled={quantity <= 1 || busy}
                onClick={() => setQuantity((n) => n - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <output aria-label="Quantity">{quantity}</output>
              <button
                disabled={quantity >= Math.min(v.stock, 20) || busy}
                onClick={() => setQuantity((n) => n + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <button className="button primary" onClick={add} disabled={!v.stock || busy}>
              {busy ? 'Adding…' : v.stock ? 'Add to bag' : 'Unavailable'}
              <ArrowRight size={18} />
            </button>
          </div>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <button className="product-save" onClick={save} aria-pressed={saved}>
            <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved to your wishlist' : 'Save for later'}
          </button>
          <div className="product-facts">
            <details open>
              <summary>Dimensions & materials</summary>
              <p>
                {p.dimensions.width} W × {p.dimensions.depth} D × {p.dimensions.height} H cm.
                <br />
                {p.material}. Finish: {v.name}.<br />
                SKU: {v.sku}
              </p>
            </details>
            <details>
              <summary>Care for your piece</summary>
              <p>{p.care}</p>
            </details>
            <details>
              <summary>Delivery & returns</summary>
              <p>
                {p.delivery}. Standard delivery is $75, or free for merchandise totals of $1,500 or
                more. White glove delivery is $150.{' '}
                <Link className="text-link" href="/delivery-returns">
                  Read delivery & returns
                </Link>
              </p>
            </details>
          </div>
        </div>
      </div>
      <div className="material-scale">
        <div>
          <h2>A sense of proportion.</h2>
          <p>
            {p.short} Use these dimensions to find the right place for it. Measure your space, leave
            room to move, and consider doorways and stairs before a real furniture purchase.
          </p>
          <dl className="dimension-list">
            <div>
              <dt>Width</dt>
              <dd>
                {p.dimensions.width}
                <span className="small"> cm</span>
              </dd>
            </div>
            <div>
              <dt>Depth</dt>
              <dd>
                {p.dimensions.depth}
                <span className="small"> cm</span>
              </dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>
                {p.dimensions.height}
                <span className="small"> cm</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="dimension-visual">
          <Image
            src={p.images[2] ?? p.images[0]}
            alt={`${p.material} detail on the ${p.name}`}
            fill
            sizes="(max-width:550px) 100vw, 45vw"
          />
          <span>
            {p.material} · {p.variants[0].name}
          </span>
        </div>
      </div>
      <Dialog
        open={zoom !== null}
        onClose={() => setZoom(null)}
        title={`${p.name} — ${zoom === 2 ? 'material detail' : 'a closer look'}`}
        wide
      >
        <div className="zoom-image">
          <Image src={p.images[zoom ?? 0]} alt={`${p.name} enlarged view`} fill sizes="850px" />
        </div>
      </Dialog>
      <div className={`mobile-purchase-bar ${sticky ? 'is-visible' : ''}`} aria-hidden={!sticky}>
        <span>
          {p.name}
          <strong>{money(v.price)}</strong>
        </span>
        <button className="button primary" disabled={!v.stock || busy} onClick={add}>
          {busy ? 'Adding…' : v.stock ? 'Add to bag' : 'Unavailable'}
          <ArrowRight size={17} />
        </button>
      </div>
    </>
  );
}
