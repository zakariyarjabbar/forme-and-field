'use client';
import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useStore } from './store-provider';
import { money, pricing } from '@/lib/money';
import { addressSchema } from '@/lib/validation';
import type { Address, DeliveryMethod } from '@/lib/types';
import { AddressFields } from './address-fields';
export function Checkout({ profile }: { profile?: Address }) {
  const store = useStore(),
    router = useRouter(),
    [delivery, setDelivery] = useState<DeliveryMethod>('standard'),
    [scenario, setScenario] = useState<'success' | 'decline'>('success'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [fields, setFields] = useState<Record<string, string>>({}),
    [key, setKey] = useState(''),
    [placingComplete, setPlacingComplete] = useState(false);
  const totals = pricing(store.cart, delivery);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setFields({});
    const form = e.currentTarget,
      data = Object.fromEntries(new FormData(form)),
      parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0]), i.message]),
      );
      setFields(fields);
      setError('Please check the highlighted delivery details.');
      const first = form.elements.namedItem(String(parsed.error.issues[0].path[0]));
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setBusy(true);
    const attemptKey = key || crypto.randomUUID();
    setKey(attemptKey);
    try {
      const result = await store.mutate({
        action: 'checkout',
        data: {
          key: attemptKey,
          delivery,
          scenario,
          address: parsed.data,
          expectedTotal: totals.total,
        },
      });
      if (result.declined) {
        setError(
          'The simulated payment was declined. No order was paid and stock is unchanged. Choose “Successful payment” to try again.',
        );
        setKey('');
      } else if (result.order) {
        setPlacingComplete(true);
        router.push(`/checkout/confirmation/${result.order.id}`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (placingComplete)
    return (
      <div className="loading-state" role="status">
        Your demo order is placed. Opening confirmation…
      </div>
    );
  if (!store.cart.length && !busy)
    return (
      <div className="empty-state">
        <h2>Your bag is waiting.</h2>
        <p>Add a piece to explore the demo checkout.</p>
        <Link className="button primary" href="/shop">
          Find a piece <ArrowRight size={18} />
        </Link>
      </div>
    );
  return (
    <div className="commerce-layout checkout-layout">
      <div>
        <div className="demo-notice">
          <strong>A demonstration, from start to finish.</strong>No real payment, card details, or
          shipment. Use fictional contact information. Your order will be saved only in this
          browser.
        </div>
        <form
          onSubmit={submit}
          noValidate
          onChange={() => {
            if (key) setKey('');
          }}
        >
          <section className="form-section">
            <h2>Where would your pieces go?</h2>
            <AddressFields address={profile} errors={fields} />
          </section>
          <section className="form-section">
            <h2>A considered arrival.</h2>
            <label className={`delivery-option ${delivery === 'standard' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="delivery"
                value="standard"
                checked={delivery === 'standard'}
                onChange={() => setDelivery('standard')}
              />
              <span>
                Standard delivery<small>Doorstep delivery, in this fictional scenario</small>
              </span>
              <span>{totals.subtotal >= 150000 ? 'Free' : money(7500)}</span>
            </label>
            <label className={`delivery-option ${delivery === 'white-glove' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="delivery"
                value="white-glove"
                checked={delivery === 'white-glove'}
                onChange={() => setDelivery('white-glove')}
              />
              <span>
                White glove delivery<small>Room placement, in this fictional scenario</small>
              </span>
              <span>{money(15000)}</span>
            </label>
          </section>
          <section className="form-section">
            <h2>Try the payment demonstration.</h2>
            <p>
              Choose an outcome to see how the store responds. No payment credentials are needed.
            </p>
            <label className="field">
              Simulated payment outcome
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as 'success' | 'decline')}
              >
                <option value="success">Successful payment</option>
                <option value="decline">Declined payment</option>
              </select>
            </label>
          </section>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <p className="small muted" style={{ margin: '20px 0' }}>
            The total below includes delivery and any applicable demo tax. No additional tax is
            added; this is a fictional scenario assumption. By continuing, you understand the{' '}
            <Link href="/terms" style={{ textDecoration: 'underline' }}>
              demo terms
            </Link>
            .
          </p>
          <button
            className="button primary full"
            disabled={busy || store.cart.some((l) => !l.available)}
            type="submit"
          >
            {busy ? 'Placing your demo order…' : `Place demo order — ${money(totals.total)}`}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
      <aside className="order-summary">
        <h2>Your considered choices.</h2>
        {store.cart.map((l) => (
          <div className="summary-item" key={l.variantId}>
            <Image src={l.image} width={62} height={62} alt={l.name} />
            <div>
              {l.name}
              <p>{l.variant}</p>
              <p>Quantity {l.quantity}</p>
            </div>
            <span>{money(l.price * l.quantity)}</span>
          </div>
        ))}
        <div className="totals" style={{ marginTop: 18 }}>
          <div>
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          <div>
            <span>{delivery === 'standard' ? 'Standard' : 'White glove'} delivery</span>
            <span>{totals.shipping ? money(totals.shipping) : 'Free'}</span>
          </div>
          <div>
            <span>Additional demo tax</span>
            <span>{money(0)}</span>
          </div>
          <div className="grand-total">
            <span>Total (USD)</span>
            <span>{money(totals.total)}</span>
          </div>
        </div>
        <Link href="/cart" className="text-link">
          Edit your bag
        </Link>
      </aside>
    </div>
  );
}
