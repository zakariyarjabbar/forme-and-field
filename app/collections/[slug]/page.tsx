import { normalizeFilters, type SearchInput } from '@/lib/filters';
import { notFound } from 'next/navigation';
import { collections } from '@/lib/content/catalog';
import { Shop } from '@/components/shop';
import { getProducts } from '@/lib/server/store';
import { session } from '@/lib/server/session';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: collections.find((c) => c.slug === slug)?.title ?? 'Collection not found' };
}
export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchInput>;
}) {
  const { slug } = await params,
    c = collections.find((c) => c.slug === slug);
  if (!c) notFound();
  const ws = await session();
  return (
    <>
      <div className="page-heading">
        <h1>{c.title}</h1>
        <p>{c.description}</p>
      </div>
      <Shop
        products={getProducts(ws?.id).filter((p) => c.products.includes(p.slug))}
        filters={normalizeFilters(await searchParams)}
      />
    </>
  );
}
