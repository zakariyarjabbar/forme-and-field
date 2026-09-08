import { socialMetadata } from '@/lib/social';
import { notFound } from 'next/navigation';
import { rooms } from '@/lib/content/editorial';
import { seedProducts } from '@/lib/content/catalog';
import { RoomScene } from '@/components/rooms';
import { ProductCard } from '@/components/product-card';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = rooms.find((item) => item.slug === slug);
  if (!item) return { title: 'Room not found' };
  return socialMetadata(
    item.title,
    item.intro,
    `/rooms/${slug}`,
    `/images/social/room-${slug}.jpg`,
  );
}
export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params,
    r = rooms.find((r) => r.slug === slug);
  if (!r) notFound();
  const products = seedProducts.filter((p) => r.products.some((rp) => rp.slug === p.slug));
  return (
    <>
      <div className="page-heading">
        <h1>{r.title}</h1>
        <p>{r.intro}</p>
      </div>
      <RoomScene room={r} products={products} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="section-heading">
          <h2>The pieces in this room.</h2>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
