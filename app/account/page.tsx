import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { session } from '@/lib/server/session';
import { accountData } from '@/lib/server/store';
import { money } from '@/lib/money';
import { DemoEntry } from '@/components/demo';
import { AddressEditor } from '@/components/address-editor';
export const metadata = { title: 'Your demo account' };
export default async function Account() {
  const ws = await session();
  if (!ws?.entered) return <DemoEntry />;
  const data = accountData(ws.id);
  return (
    <>
      <div className="page-heading">
        <h1>Welcome back, {data.profile.name.split(' ')[0]}.</h1>
        <p>Your considered choices, all in one place.</p>
      </div>
      <div className="account-layout">
        <aside className="account-side">
          <h2>Your account</h2>
          <p>{data.profile.email}</p>
          <Link href="/wishlist" className="text-link">
            Saved pieces <ArrowRight size={16} />
          </Link>
          <Link href="/admin" className="text-link">
            Merchant view <ArrowRight size={16} />
          </Link>
          <Link href="/demo" className="text-link">
            Demo settings <ArrowRight size={16} />
          </Link>
        </aside>
        <div className="account-content">
          <section>
            <h2>Your orders.</h2>
            {data.orders.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <Link href={`/account/orders/${o.id}`}>{o.reference}</Link>
                        </td>
                        <td>
                          {new Date(o.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                        </td>
                        <td>
                          <span className={`status-badge ${o.status}`}>{o.status}</span>
                        </td>
                        <td className="right">
                          {money(o.total)}
                          {o.refund && <div className="small muted">Simulated refund</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <p className="muted">Your first good piece is still out there.</p>
                <Link className="text-link" href="/shop">
                  Explore the collection <ArrowRight size={18} />
                </Link>
              </>
            )}
          </section>
          <section>
            <h2>Somewhere to call home.</h2>
            <div className="address-grid">
              {data.addresses.map((a) => (
                <div className="address-card" key={a.id}>
                  <strong>{a.data.name}</strong>
                  <p>
                    {a.data.line1}
                    <br />
                    {a.data.line2 && (
                      <>
                        {a.data.line2}
                        <br />
                      </>
                    )}
                    {a.data.city}, {a.data.region} {a.data.postal}
                    <br />
                    {a.data.country}
                    <br />
                    {a.data.email}
                  </p>
                  <AddressEditor address={a.data} id={a.id} />
                </div>
              ))}
            </div>
            <AddressEditor />
          </section>
          <div className="demo-notice">
            Demo identity · Your profile, addresses and orders are private to this session and
            expire after seven days. No real products will be shipped.
          </div>
        </div>
      </div>
    </>
  );
}
