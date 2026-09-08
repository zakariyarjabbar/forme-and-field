import Image from 'next/image';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import type { Order } from '@/lib/types';
import { money } from '@/lib/money';
import { OrderActions } from './order-actions';
export function OrderView({
  order: o,
  confirmation = false,
  merchant = false,
}: {
  order: Order;
  confirmation?: boolean;
  merchant?: boolean;
}) {
  return (
    <div className="order-confirmation">
      {confirmation && (
        <div className="confirmation-mark">
          <Check size={25} />
        </div>
      )}
      <h1>{confirmation ? 'A few good choices.' : `Order ${o.reference}`}</h1>
      <p className="muted">
        {confirmation
          ? 'Your demo order is placed. Nothing was charged, and no products will be shipped.'
          : 'Your order record, saved in this isolated demo workspace.'}
      </p>
      <div className="order-meta">
        <span>{o.reference}</span>
        <span>
          {new Date(o.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </span>
        <span className={`status-badge ${o.status}`}>{o.status}</span>
      </div>
      {o.lines.map((l) => (
        <div className="summary-item" key={l.variantId}>
          <Image src={l.image} width={62} height={62} alt={l.name} />
          <div>
            {l.name}
            <p>
              {l.variant} · {l.sku}
            </p>
            <p>
              {l.quantity} × {money(l.price)}
            </p>
          </div>
          <span>{money(l.price * l.quantity)}</span>
        </div>
      ))}
      <div className="order-addresses">
        <div>
          <h2>Delivery address</h2>
          <p>
            {o.address.name}
            <br />
            {o.address.line1}
            <br />
            {o.address.line2 && (
              <>
                {o.address.line2}
                <br />
              </>
            )}
            {o.address.city}, {o.address.region} {o.address.postal}
            <br />
            {o.address.country}
          </p>
        </div>
        <div>
          <h2>{o.delivery === 'standard' ? 'Standard' : 'White glove'} delivery</h2>
          <p>
            {o.address.email}
            <br />
            Shipping and delivery updates are simulated.
            <br />A confirmation preview is saved in your merchant outbox.
          </p>
        </div>
      </div>
      <div className="totals">
        <div>
          <span>Subtotal</span>
          <span>{money(o.subtotal)}</span>
        </div>
        <div>
          <span>Delivery</span>
          <span>{o.shipping ? money(o.shipping) : 'Complimentary'}</span>
        </div>
        <div className="grand-total">
          <span>{o.refund ? 'Original total' : 'Total'}</span>
          <span>{money(o.total)}</span>
        </div>
        {o.refund && (
          <div>
            <span>Simulated refund</span>
            <span>{money(o.total)}</span>
          </div>
        )}
      </div>
      <OrderActions order={o} merchant={merchant} />
      <div className="demo-actions">
        <Link href={merchant ? '/admin' : '/account'} className="button outline">
          {merchant ? 'Back to merchant view' : 'Your demo account'}
          <ArrowRight size={18} />
        </Link>
        <Link href="/shop" className="text-link">
          Continue exploring <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
