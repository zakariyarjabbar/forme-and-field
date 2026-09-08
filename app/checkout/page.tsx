import { LocalCheckout } from '@/components/local-pages';
export const metadata = { title: 'Demo checkout' };
export default async function CheckoutPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Bring it all together.</h1>
        <p>Your pieces, your space. A complete demo checkout with nothing to pay.</p>
      </div>
      <LocalCheckout />
    </>
  );
}
