import { Cart } from '@/components/cart';
export const metadata = { title: 'Your bag' };
export default function CartPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Your bag.</h1>
        <p>A little closer to a room that feels like you.</p>
      </div>
      <Cart />
    </>
  );
}
