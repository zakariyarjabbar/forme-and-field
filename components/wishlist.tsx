'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useStore } from './store-provider';
import { ProductCard } from './product-card';
export function Wishlist({ products }: { products: Product[] }) {
  const store = useStore(),
    saved = products.filter((p) => store.wishlist.includes(p.id));
  return (
    <div className="content-wrap">
      {saved.length ? (
        <>
          <p className="small muted">
            {saved.length} saved {saved.length === 1 ? 'piece' : 'pieces'} · Kept here for your next
            visit, for up to seven days.
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
