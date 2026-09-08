import { session } from '@/lib/server/session';
import { Checkout } from '@/components/checkout';
export const metadata = { title: 'Demo checkout' };
export default async function CheckoutPage() {
  const ws = await session();
  return (
    <>
      <div className="page-heading">
        <h1>Bring it all together.</h1>
        <p>Your pieces, your space. A complete demo checkout with nothing to pay.</p>
      </div>
      <Checkout profile={ws?.entered ? ws.profile : undefined} />
    </>
  );
}
