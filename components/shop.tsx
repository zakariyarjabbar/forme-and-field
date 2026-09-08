'use client';
import { useState, useTransition, type FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X, Search, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { categories } from '@/lib/content/catalog';
import { useStore } from './store-provider';
import { ProductCard } from './product-card';
import { Dialog } from './dialog';
import type { Filters } from '@/lib/filters';
export type { Filters } from '@/lib/filters';
const materialMatches = (p: Product, m: string) => {
  const s = p.material.toLowerCase();
  return m === 'Metal'
    ? /brass|bronze|metal|steel/.test(s)
    : m === 'Ceramic'
      ? /ceramic|stoneware/.test(s)
      : s.includes(m.toLowerCase());
};
export function Shop({
  products: seeded,
  filters = {},
  collection = false,
}: {
  products: Product[];
  filters: Filters;
  collection?: boolean;
}) {
  const store = useStore();
  const products = store.data.products.filter(
    (p) => !p.archived && (!collection || seeded.some((x) => x.id === p.id)),
  );
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname(),
    router = useRouter(),
    [filterOpen, setFilterOpen] = useState(false);
  const params = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => !!v) as [string, string][],
    ),
    sort = filters.sort || 'featured';
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget),
      search = new URLSearchParams();
    for (const [key, value] of data) {
      if (value && typeof value === 'string') search.set(key, value);
    }
    startTransition(() => router.push(`${pathname}?${search}`, { scroll: false }));
    setFilterOpen(false);
  }
  function remove(key: string) {
    const updated = new URLSearchParams(params);
    updated.delete(key);
    return `${pathname}?${updated}`;
  }
  const results = products
    .filter((p) => {
      const q = (filters.q || '').toLowerCase();
      return (
        (!q ||
          `${p.name} ${p.description} ${p.category} ${p.material} ${p.variants.map((v) => v.name).join(' ')}`
            .toLowerCase()
            .includes(q)) &&
        (!filters.category || p.category === filters.category) &&
        (!filters.material || materialMatches(p, filters.material)) &&
        (!filters.availability ||
          (filters.availability === 'in-stock'
            ? p.variants.some((v) => v.stock > 0)
            : filters.availability === 'low-stock'
              ? p.variants.some((v) => v.stock > 0 && v.stock <= 3)
              : p.variants.every((v) => v.stock === 0))) &&
        (!filters.min ||
          Math.min(...p.variants.map((v) => v.price)) >= Number(filters.min) * 100) &&
        (!filters.max || Math.min(...p.variants.map((v) => v.price)) <= Number(filters.max) * 100)
      );
    })
    .sort((a, b) =>
      sort === 'price-asc'
        ? Math.min(...a.variants.map((v) => v.price)) - Math.min(...b.variants.map((v) => v.price))
        : sort === 'price-desc'
          ? Math.min(...b.variants.map((v) => v.price)) -
            Math.min(...a.variants.map((v) => v.price))
          : sort === 'name'
            ? a.name.localeCompare(b.name)
            : Number(b.featured) - Number(a.featured),
    );
  function filterForm(mobile = false) {
    return (
      <form
        onSubmit={apply}
        key={params.toString() + (mobile ? 'mobile' : 'desktop')}
        className="filter-form"
      >
        <input type="hidden" name="q" value={filters.q || ''} />
        <input type="hidden" name="sort" value={sort} />
        <fieldset className="filter-group" disabled={!store.ready || isPending}>
          <legend>Category</legend>
          <label>
            <input name="category" value="" type="radio" defaultChecked={!filters.category} />
            All pieces
          </label>
          {categories.map((c) => (
            <label key={c}>
              <input
                type="radio"
                name="category"
                value={c}
                defaultChecked={filters.category === c}
              />
              {c}
            </label>
          ))}
        </fieldset>
        <fieldset className="filter-group" disabled={!store.ready || isPending}>
          <legend>Material</legend>
          <select name="material" aria-label="Material" defaultValue={filters.material || ''}>
            <option value="">All materials</option>
            {['Oak', 'Walnut', 'Linen', 'Travertine', 'Metal', 'Glass', 'Wool', 'Ceramic'].map(
              (m) => (
                <option key={m}>{m}</option>
              ),
            )}
          </select>
        </fieldset>
        <fieldset className="filter-group" disabled={!store.ready || isPending}>
          <legend>Availability</legend>
          {[
            ['', 'All pieces'],
            ['in-stock', 'In stock'],
            ['low-stock', 'Low stock (1–3)'],
            ['unavailable', 'Currently unavailable'],
          ].map(([v, label]) => (
            <label key={v}>
              <input
                name="availability"
                type="radio"
                value={v}
                defaultChecked={(filters.availability || '') === v}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset className="filter-group" disabled={!store.ready || isPending}>
          <legend>Price (USD)</legend>
          <div className="price-inputs">
            <label>
              From
              <input
                name="min"
                type="number"
                min="0"
                max="1000000"
                step="1"
                defaultValue={filters.min || ''}
                placeholder="0"
              />
            </label>
            <label>
              To
              <input
                name="max"
                type="number"
                min="0"
                max="1000000"
                step="1"
                defaultValue={filters.max || ''}
                placeholder="Any"
              />
            </label>
          </div>
        </fieldset>
        <button className="button secondary full" type="submit">
          Apply filters <ArrowRight size={17} />
        </button>
        <Link href={pathname} onClick={() => setFilterOpen(false)} className="text-link center">
          Reset all
        </Link>
      </form>
    );
  }
  const active = Object.entries(filters).filter(([k, v]) => k !== 'sort' && v);
  return (
    <>
      {(pathname === '/search' || filters.q) && (
        <form action={pathname} className="catalog-search">
          <div className="input-with-button">
            <input
              type="search"
              name="q"
              aria-label="Search the catalog"
              defaultValue={filters.q}
              placeholder="Search furniture, materials, lighting…"
            />
            <button className="button primary" aria-label="Search catalog">
              <Search size={20} />
            </button>
          </div>
        </form>
      )}
      <div className="shop-toolbar">
        <button className="mobile-filter-button" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={17} />
          Filters{active.length > 0 && ` (${active.length})`}
        </button>
        <span aria-live="polite">
          {results.length} {results.length === 1 ? 'piece' : 'pieces'}
        </span>
        <label>
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => {
              const q = new URLSearchParams(params);
              q.set('sort', e.target.value);
              startTransition(() => router.push(`${pathname}?${q}`, { scroll: false }));
            }}
            aria-label="Sort pieces"
            disabled={!store.ready || isPending}
          >
            <option value="featured">Our selection</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
      </div>
      <div className="shop-layout" aria-busy={isPending}>
        {isPending && (
          <div className="catalog-pending" role="status">
            Finding your pieces…
          </div>
        )}
        <aside className="desktop-filters" aria-label="Product filters">
          {filterForm()}
        </aside>
        <div>
          {active.length > 0 && (
            <div className="active-filters">
              {active.map(([key, value]) => (
                <Link
                  className="active-filter"
                  href={remove(key)}
                  key={key}
                  aria-label={`Remove ${key} filter: ${value}`}
                >
                  {key === 'min' ? 'From $' : key === 'max' ? 'Up to $' : ''}
                  {value}
                  <X size={13} />
                </Link>
              ))}
              <Link href={pathname} className="text-link small">
                Clear all
              </Link>
            </div>
          )}
          {results.length ? (
            <div className="product-grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>A little more room to look.</h2>
              <p>
                No pieces match these choices. Try a broader material, a higher price limit, or
                clear your filters.
              </p>
              <Link className="button primary" href={pathname}>
                Show all pieces <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Find the right piece"
        drawer
      >
        <div className="filter-sheet-content">{filterForm(true)}</div>
      </Dialog>
    </>
  );
}
