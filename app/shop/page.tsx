import { normalizeFilters, type SearchInput } from '@/lib/filters';
import { Shop } from '@/components/shop';
import { getProducts } from '@/lib/server/store';
import { session } from '@/lib/server/session';
export const metadata = {
  title: 'All pieces',
  description: 'Explore seating, tables, lighting, storage and objects in considered materials.',
  alternates: { canonical: '/shop' },
};
export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchInput> }) {
  const filters = normalizeFilters(await searchParams),
    ws = await session();
  return (
    <>
      <div className="page-heading">
        <h1>{filters.category || 'A place for good pieces.'}</h1>
        <p>
          Furniture, lighting, and the details that make a room yours. Find a piece to live with.
        </p>
      </div>
      <Shop products={getProducts(ws?.id)} filters={filters} />
    </>
  );
}
