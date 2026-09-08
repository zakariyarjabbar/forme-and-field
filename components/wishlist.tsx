'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStore } from './store-provider';
import { ProductCard } from './product-card';
export function Wishlist() {
  const store = useStore(),
    saved = store.data.products.filter((p) => !p.archived && store.wishlist.includes(p.id));
  if (!store.ready)
    return (
      <div className="empty-state" role="status">
        Loading your saved pieces…
      </div>
    );
  return (
    <div className="content-wrap">
      {saved.length ? (
        <>
          <p className="small muted">
            {saved.length} saved {saved.length === 1 ? 'piece' : 'pieces'} · Kept here for your next
            visit in this browser.
          </p>
          <div className="product-grid">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>Keep the pieces you come back to.</h2>
          <p>Use the heart on any piece to save it here. A room can come together slowly.</p>
          <Link href="/shop" className="button primary">
            Explore all pieces <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
