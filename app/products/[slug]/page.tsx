import { socialMetadata, brandImage } from '@/lib/social';
import { seedProducts } from '@/lib/content/catalog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { session } from '@/lib/server/session';
import { getProduct, getProducts } from '@/lib/server/store';
import { ProductDetail } from '@/components/product-detail';
import { ProductCard } from '@/components/product-card';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ws = await session();
  const p = getProduct(slug, ws?.id);
  if (!p) return { title: 'Piece not found' };
  return socialMetadata(
    p.name,
    p.description,
    `/products/${slug}`,
    seedProducts.some((item) => item.slug === slug)
      ? `/images/social/product-${slug}.jpg`
      : brandImage,
  );
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params,
    ws = await session(),
    p = getProduct(slug, ws?.id);
  if (!p) notFound();
  const related = getProducts(ws?.id)
    .filter((x) => p.related.includes(x.slug))
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
      <ProductDetail product={p} />
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
