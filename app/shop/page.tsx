import { normalizeFilters, type SearchInput } from '@/lib/filters';
import { Shop } from '@/components/shop';
import { seedProducts } from '@/lib/content/catalog';
export const metadata = {
  title: 'All pieces',
  description: 'Explore seating, tables, lighting, storage and objects in considered materials.',
  alternates: { canonical: '/shop' },
};
export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchInput> }) {
  const filters = normalizeFilters(await searchParams);
  return (
    <>
      <div className="page-heading">
        <h1>{filters.category || 'A place for good pieces.'}</h1>
        <p>
          Furniture, lighting, and the details that make a room yours. Find a piece to live with.
        </p>
      </div>
      <Shop products={seedProducts} filters={filters} />
    </>
  );
}
