'use client';
import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { categories } from '@/lib/content/catalog';
import { productSchema } from '@/lib/validation';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
type EditableVariant = {
  id?: string;
  sku: string;
  name: string;
  color: string;
  price: number;
  stock: number;
};
export function AdminProductEditor({
  product,
  assets,
  onClose,
}: {
  product: Product | null;
  assets: { image: string; name: string }[];
  onClose: () => void;
}) {
  const store = useStore(),
    [image, setImage] = useState(product?.images[0] || assets[0].image),
    [variants, setVariants] = useState<EditableVariant[]>(
      product?.variants.map((v) => ({ ...v })) || [
        { sku: '', name: 'Natural finish', color: '#b39468', price: 0, stock: 0 },
      ],
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  function variant(index: number, field: string, value: string) {
    setVariants((old) =>
      old.map((v, i) =>
        i === index
          ? { ...v, [field]: ['price', 'stock'].includes(field) ? Number(value) : value }
          : v,
      ),
    );
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = productSchema.safeParse({
      ...data,
      id: product?.id,
      width: Number(data.width),
      height: Number(data.height),
      depth: Number(data.depth),
      image,
      variants,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' '));
      return;
    }
    setBusy(true);
    try {
      await store.mutate({ action: 'product', data: parsed.data });
      store.notify(`${parsed.data.name} saved in your workspace.`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onClose={onClose}
      title={product ? `Edit ${product.name}` : 'Create a new piece'}
      wide
    >
      <form className="admin-form" onSubmit={save}>
        <div className="form-grid">
          <label className="field">
            Product name
            <input name="name" defaultValue={product?.name} required maxLength={100} />
          </label>
          <label className="field">
            URL slug
            <input
              name="slug"
              defaultValue={product?.slug}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="a-new-piece"
            />
          </label>
          <label className="field">
            Category
            <select name="category" defaultValue={product?.category || 'Seating'}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Material
            <input name="material" defaultValue={product?.material} required />
          </label>
          <label className="field span-2">
            Short description
            <input name="short" defaultValue={product?.short} required maxLength={180} />
          </label>
          <label className="field span-2">
            Full description
            <textarea
              name="description"
              defaultValue={product?.description}
              required
              minLength={20}
            />
          </label>
        </div>
        <h3>Dimensions & care</h3>
        <div className="form-grid compact">
          {(['width', 'depth', 'height'] as const).map((key) => (
            <label className="field" key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)} (cm)
              <input
                type="number"
                name={key}
                defaultValue={product?.dimensions[key] || 1}
                required
                min="0.1"
                max="1000"
                step="0.1"
              />
            </label>
          ))}
          <label className="field">
            Delivery estimate
            <input
              name="delivery"
              defaultValue={product?.delivery || 'Dispatches in 7–14 demo business days'}
              required
            />
          </label>
          <label className="field span-2">
            Care instructions
            <textarea
              name="care"
              defaultValue={product?.care || 'Dust gently with a soft cloth. Wipe spills promptly.'}
              required
            />
          </label>
        </div>
        <h3>Choose catalog imagery</h3>
        <p className="small muted">
          Use the image that actually represents your piece. This library contains the original
          conceptual catalog assets.
        </p>
        <div className="asset-picker" role="group" aria-label="Product image library">
          {assets.map((a) => (
            <button
              type="button"
              key={a.image}
              className={image === a.image ? 'selected' : ''}
              aria-pressed={image === a.image}
              onClick={() => setImage(a.image)}
            >
              <Image src={a.image} alt={a.name} width={100} height={100} />
              <span>{a.name}</span>
            </button>
          ))}
        </div>
        <h3>Finishes, prices & inventory</h3>
        <p className="small muted">
          Prices use integer cents (89000 = $890). Each finish requires a unique SKU. Stock is
          specific to your demo workspace.
        </p>
        {variants.map((v, i) => (
          <fieldset className="variant-editor" key={i}>
            <legend>Finish {i + 1}</legend>
            <div className="form-grid compact">
              <label className="field">
                Finish name
                <input
                  value={v.name}
                  onChange={(e) => variant(i, 'name', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                SKU
                <input value={v.sku} onChange={(e) => variant(i, 'sku', e.target.value)} required />
              </label>
              <label className="field">
                Price in USD cents
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step="1"
                  value={v.price}
                  onChange={(e) => variant(i, 'price', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                Available stock
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="1"
                  value={v.stock}
                  onChange={(e) => variant(i, 'stock', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                Finish colour
                <input
                  type="color"
                  value={v.color}
                  onChange={(e) => variant(i, 'color', e.target.value)}
                />
              </label>
            </div>
          </fieldset>
        ))}
        <button
          type="button"
          className="text-link"
          disabled={variants.length >= 12}
          onClick={() =>
            setVariants((v) => [
              ...v,
              { sku: '', name: 'New finish', color: '#b39468', price: 0, stock: 0 },
            ])
          }
        >
          Add a finish
        </button>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="text-link" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
