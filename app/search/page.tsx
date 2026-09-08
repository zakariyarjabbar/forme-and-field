import { normalizeFilters, type SearchInput } from '@/lib/filters';
import { Shop } from '@/components/shop';
import { seedProducts } from '@/lib/content/catalog';
export const metadata = { title: 'Search' };
export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchInput> }) {
  const filters = normalizeFilters(await searchParams);
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
      <Shop products={seedProducts} filters={filters} />
    </>
  );
}
