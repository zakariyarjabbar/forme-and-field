import { normalizeFilters, type SearchInput } from '@/lib/filters';
import { Shop } from '@/components/shop';
import { getProducts } from '@/lib/server/store';
import { session } from '@/lib/server/session';
export const metadata = { title: 'Search' };
export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchInput> }) {
  const filters = normalizeFilters(await searchParams),
    ws = await session();
  return (
    <>
      <div className="page-heading">
        <h1>
          {filters.q
            ? `Looking for “${String(filters.q).slice(0, 100)}”`
            : 'Find something that feels right.'}
        </h1>
        <p>Search by piece, material, or the kind of room you have in mind.</p>
      </div>
      <Shop products={getProducts(ws?.id)} filters={filters} />
    </>
  );
}
