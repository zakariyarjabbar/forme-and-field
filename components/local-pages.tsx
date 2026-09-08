'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useStore } from './store-provider';
import { DemoEntry } from './demo';
import { AdminDashboard } from './admin-dashboard';
import { OrderView } from './order-view';
import { Checkout } from './checkout';
import { ProductDetail } from './product-detail';
import { ProductCard } from './product-card';
import { assetLibrary } from '@/lib/local/store';
import NotFound from '@/app/not-found';
export function LocalLoading() {
  return (
    <div className="empty-state" role="status">
      <p>Loading your browser demo…</p>
    </div>
  );
}
export function LocalAdmin() {
  const store = useStore();
  if (!store.ready) return <LocalLoading />;
  if (!store.entered) return <DemoEntry destination="/admin" />;
  return <AdminDashboard data={store.data} assets={assetLibrary} />;
}
export function LocalCheckout() {
  const store = useStore();
  if (!store.ready) return <LocalLoading />;
  return <Checkout profile={store.entered ? store.data.profile : undefined} />;
}
export function LocalOrder({
  id,
  merchant = false,
  confirmation = false,
}: {
  id: string;
  merchant?: boolean;
  confirmation?: boolean;
}) {
  const store = useStore();
  if (!store.ready) return <LocalLoading />;
  const order = store.data.orders.find((o) => o.id === id);
  if (!order || (merchant && !store.entered)) return <NotFound />;
  return <OrderView order={order} merchant={merchant} confirmation={confirmation} />;
}
export function LocalProduct({ slug }: { slug: string }) {
  const store = useStore(),
    p = store.data.products.find((p) => p.slug === slug && !p.archived);
  if (!p) return store.ready ? <NotFound /> : <LocalLoading />;
  const related = store.data.products
    .filter((x) => !x.archived && p.related.includes(x.slug))
    .slice(0, 4);
  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/shop">All pieces</Link>
        <ChevronRight size={12} />
        <Link href={`/shop?category=${p.category}`}>{p.category}</Link>
        <ChevronRight size={12} />
        <span>{p.name}</span>
      </nav>
      <ProductDetail key={p.id} product={p} />
      {related.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>In good company.</h2>
            <Link className="text-link" href="/shop">
              Explore more
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
