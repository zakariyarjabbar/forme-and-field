'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import type { adminData } from '@/lib/server/store';
import type { Product } from '@/lib/types';
import { money } from '@/lib/money';
import { useStore } from './store-provider';
import { AdminProductEditor } from './admin-product-editor';
import { Dialog } from './dialog';
type Data = ReturnType<typeof adminData>;
const date = (s: string) =>
  new Date(s).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
export function AdminDashboard({
  data,
  assets,
}: {
  data: Data;
  assets: { image: string; name: string }[];
}) {
  const store = useStore(),
    [tab, setTab] = useState('Overview'),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('all'),
    [editor, setEditor] = useState<Product | null | undefined>(undefined),
    [selectedInquiry, setSelectedInquiry] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const activeOrders = data.orders.filter((o) => o.status !== 'cancelled'),
    revenue = activeOrders.reduce((n, o) => n + o.total, 0),
    refunded = data.orders.filter((o) => o.refund).reduce((n, o) => n + o.total, 0),
    low = data.products.flatMap((p) => p.variants).filter((v) => v.stock <= 3).length;
  const orders = data.orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      `${o.reference} ${o.address.name} ${o.address.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const products = data.products.filter(
    (p) =>
      `${p.name} ${p.category} ${p.material} ${p.variants.map((v) => v.sku).join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === 'all' || status === 'archived'
        ? status === 'all' || p.archived
        : status === 'active'
          ? !p.archived
          : status === 'low'
            ? p.variants.some((v) => v.stock <= 3)
            : true),
  );
  const inquiries = data.inquiries.filter(
    (i) =>
      (status === 'all' || i.status === status) &&
      `${i.name} ${i.email} ${i.message}`.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = data.inquiries.find((i) => i.id === selectedInquiry);
  async function mutate(input: Record<string, unknown>) {
    setError('');
    setBusy(true);
    try {
      await store.mutate(input);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function orderTable() {
    return orders.length ? (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`}>{o.reference}</Link>
                </td>
                <td>
                  {o.address.name}
                  <div className="small muted">{o.address.email}</div>
                </td>
                <td>{date(o.createdAt)}</td>
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
      <div className="empty-state">
        <h3>No orders in view.</h3>
        <p>
          {data.orders.length
            ? 'Try a different search or status.'
            : 'Place a demo order in the storefront to see the complete workflow here.'}
        </p>
        <Link className="text-link" href="/shop">
          Explore the store <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  }
  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <h1>The merchant’s view.</h1>
          <p>Operate your own FORME & FIELD demo workspace.</p>
        </div>
        <Link className="button outline" href="/shop">
          View your storefront <ArrowUpRight size={17} />
        </Link>
      </header>
      <nav className="admin-nav" aria-label="Merchant sections">
        {['Overview', 'Orders', 'Catalog', 'Inventory', 'Inquiries', 'Outbox'].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setQuery('');
              setStatus('all');
            }}
            className={tab === t ? 'active' : ''}
            aria-current={tab === t ? 'page' : undefined}
          >
            {t}
            {t === 'Inquiries' && data.inquiries.filter((i) => i.status === 'new').length > 0
              ? ` (${data.inquiries.filter((i) => i.status === 'new').length})`
              : ''}
          </button>
        ))}
      </nav>
      <div className="demo-notice">
        Isolated demo · Changes affect only your workspace. Payments, refunds, shipments and
        deliveries are simulated. Outbox messages are local previews.
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {tab === 'Overview' && (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Net demo order value</span>
              <strong>{money(revenue)}</strong>
              <p className="small muted">Includes delivery; cancelled orders excluded</p>
            </div>
            <div className="admin-stat">
              <span>Active orders</span>
              <strong>{activeOrders.length}</strong>
              <p className="small muted">Paid through delivered</p>
            </div>
            <div className="admin-stat">
              <span>Low / unavailable finishes</span>
              <strong>{low}</strong>
              <p className="small muted">Three or fewer units</p>
            </div>
            <div className="admin-stat">
              <span>Simulated refunds</span>
              <strong>{money(refunded)}</strong>
              <p className="small muted">Cancelled order totals</p>
            </div>
          </div>
          <section className="admin-panel">
            <div className="admin-section-header">
              <h2>Recent orders</h2>
              <button className="text-link" onClick={() => setTab('Orders')}>
                All orders
              </button>
            </div>
            {orderTable()}
          </section>
          <section className="admin-activity">
            <h2>Workspace activity</h2>
            {data.activity.length ? (
              data.activity.map((a) => (
                <div className="activity-row" key={a.id}>
                  <span>{a.message}</span>
                  <time dateTime={a.createdAt}>{date(a.createdAt)}</time>
                </div>
              ))
            ) : (
              <p className="muted" style={{ marginTop: 20 }}>
                Your important catalog, order and inquiry changes will appear here.
              </p>
            )}
          </section>
        </>
      )}
      {tab === 'Orders' && (
        <section className="admin-panel">
          <div className="admin-section-header">
            <h2>Orders</h2>
            <span className="small muted">{orders.length} records</span>
          </div>
          <div className="admin-filters">
            <input
              aria-label="Search orders"
              placeholder="Order reference, name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="Order status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {['paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {orderTable()}
        </section>
      )}
      {(tab === 'Catalog' || tab === 'Inventory') && (
        <section className="admin-panel">
          <div className="admin-section-header">
            <h2>{tab === 'Catalog' ? 'Your collection' : 'Stock by finish'}</h2>
            {tab === 'Catalog' && (
              <button className="button primary" onClick={() => setEditor(null)}>
                <Plus size={17} />
                Create product
              </button>
            )}
          </div>
          <div className="admin-filters">
            <input
              aria-label="Search products"
              placeholder="Search names, materials or SKUs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="Catalog status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All products</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="low">Low / unavailable stock</option>
            </select>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Piece</th>
                  <th>{tab === 'Inventory' ? 'Finish / SKU' : 'Category'}</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.flatMap((p) =>
                  tab === 'Inventory'
                    ? p.variants.map((v) => (
                        <tr key={v.id}>
                          <td>
                            <div className="admin-product">
                              <Image src={p.images[0]} width={45} height={45} alt="" />
                              <span>
                                {p.name}
                                {p.archived && <small className="small muted"> · Archived</small>}
                              </span>
                            </div>
                          </td>
                          <td>
                            {v.name}
                            <div className="small muted">{v.sku}</div>
                          </td>
                          <td>{money(v.price)}</td>
                          <td>
                            <span className={v.stock <= 3 ? 'status-badge cancelled' : ''}>
                              {v.stock === 0 ? 'Unavailable' : v.stock}
                            </span>
                          </td>
                          <td>
                            <button className="table-action" onClick={() => setEditor(p)}>
                              Edit stock
                            </button>
                          </td>
                        </tr>
                      ))
                    : [
                        <tr key={p.id}>
                          <td>
                            <div className="admin-product">
                              <Image src={p.images[0]} width={45} height={45} alt="" />
                              <span>
                                {p.name}
                                <div className="small muted">
                                  {p.archived ? 'Archived' : p.slug}
                                </div>
                              </span>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td>From {money(Math.min(...p.variants.map((v) => v.price)))}</td>
                          <td>
                            {p.variants.reduce((n, v) => n + v.stock, 0)} across {p.variants.length}{' '}
                            finishes
                          </td>
                          <td>
                            <button className="table-action" onClick={() => setEditor(p)}>
                              Edit
                            </button>
                            <button
                              className="table-action"
                              disabled={busy}
                              onClick={() =>
                                mutate({ action: 'archive', id: p.id, archived: !p.archived })
                              }
                            >
                              {p.archived ? 'Restore' : 'Archive'}
                            </button>
                          </td>
                        </tr>,
                      ],
                )}
              </tbody>
            </table>
            {!products.length && (
              <div className="empty-state">
                <h3>No matching pieces.</h3>
                <p>Clear the search or choose a different catalog status.</p>
              </div>
            )}
          </div>
        </section>
      )}
      {tab === 'Inquiries' && (
        <section className="admin-panel">
          <div className="admin-section-header">
            <h2>Conversations to consider</h2>
            <span className="small muted">{inquiries.length} inquiries</span>
          </div>
          <div className="admin-filters">
            <input
              aria-label="Search inquiries"
              placeholder="Search people or messages"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="Inquiry status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All inquiries</option>
              <option value="new">New</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          {inquiries.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Topic</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((i) => (
                    <tr key={i.id}>
                      <td>
                        {i.name}
                        <div className="small muted">{i.email}</div>
                      </td>
                      <td>{i.topic}</td>
                      <td>{date(i.createdAt)}</td>
                      <td>
                        <span className="status-badge">{i.status}</span>
                      </td>
                      <td>
                        <button className="table-action" onClick={() => setSelectedInquiry(i.id)}>
                          Read inquiry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>A quiet inbox.</h3>
              <p>Submit a demo contact inquiry to see it here.</p>
              <Link className="text-link" href="/contact">
                Open the contact form
              </Link>
            </div>
          )}
        </section>
      )}
      {tab === 'Outbox' && (
        <section className="admin-panel">
          <h2>Messages, kept here.</h2>
          <p className="muted small" style={{ margin: '15px 0 25px' }}>
            External email delivery is unconfigured. These previews are stored in your workspace;
            nothing has been sent.
          </p>
          {data.outbox.length ? (
            data.outbox.map((m) => (
              <details className="message-preview" key={m.id}>
                <summary>{m.subject}</summary>
                <p className="small muted">
                  To {m.recipient} · {date(m.createdAt)} · Local preview
                </p>
                <pre>{m.body}</pre>
              </details>
            ))
          ) : (
            <div className="empty-state">
              <h3>No message previews yet.</h3>
              <p>Complete an order or submit an inquiry to create a local acknowledgment.</p>
            </div>
          )}
        </section>
      )}
      {editor !== undefined && (
        <AdminProductEditor product={editor} assets={assets} onClose={() => setEditor(undefined)} />
      )}
      <Dialog
        open={!!selected}
        onClose={() => setSelectedInquiry(null)}
        title={selected?.topic || 'Inquiry'}
      >
        <div className="inquiry-body">
          {selected && (
            <>
              <strong>{selected.name}</strong>
              <p className="small muted">
                {selected.email} · {date(selected.createdAt)}
              </p>
              <p>{selected.message}</p>
              <button
                className="button primary full"
                disabled={busy}
                onClick={() =>
                  mutate({
                    action: 'inquiry-status',
                    id: selected.id,
                    status: selected.status === 'new' ? 'resolved' : 'new',
                  })
                }
              >
                {selected.status === 'new' ? 'Mark resolved' : 'Reopen inquiry'}
              </button>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}
