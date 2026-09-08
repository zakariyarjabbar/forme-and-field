import { Wishlist } from '@/components/wishlist';
import { getProducts } from '@/lib/server/store';
import { session } from '@/lib/server/session';
export const metadata = { title: 'Saved pieces' };
export default async function WishlistPage() {
  const ws = await session();
  return (
    <>
      <div className="page-heading">
        <h1>Worth keeping in mind.</h1>
        <p>Your own small collection of possibilities.</p>
      </div>
      <Wishlist products={getProducts(ws?.id)} />
    </>
  );
}
