import { Wishlist } from '@/components/wishlist';
export const metadata = { title: 'Saved pieces' };
export default async function WishlistPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Worth keeping in mind.</h1>
        <p>Your own small collection of possibilities.</p>
      </div>
      <Wishlist />
    </>
  );
}
