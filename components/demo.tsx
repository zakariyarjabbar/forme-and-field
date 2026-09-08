'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStore } from './store-provider';
import { Dialog } from './dialog';
export function DemoEntry({ destination = '/account' }: { destination?: string }) {
  const store = useStore(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reset, setReset] = useState(false);
  async function enter() {
    setBusy(true);
    setError('');
    try {
      await store.mutate({ action: 'enter' });
      if (window.location.pathname !== destination) window.location.assign(destination);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function doReset() {
    setBusy(true);
    setError('');
    try {
      await store.mutate({ action: 'reset', confirmation: 'RESET' });
      setReset(false);
      store.notify('Your demo has been reset to the starting collection.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="demo-entry">
      <h1>
        Take a look
        <br />
        <em>behind the store.</em>
      </h1>
      <p className="intro">
        Shop a room, place a demo order, then see it from the merchant’s side. One complete
        experience, in a workspace that belongs only to your visit.
      </p>
      <div className="demo-notice">
        <strong>A fictional studio. A working demonstration.</strong>No products are sold or
        shipped. No real card details or passwords are needed. Sample profile and address details
        use reserved example domains.
      </div>
      <div className="demo-actions">
        {store.entered ? (
          <>
            <Link className="button primary" href="/account">
              Your demo account <ArrowRight size={18} />
            </Link>
            <Link className="button outline" href="/admin">
              Open merchant view <ArrowRight size={18} />
            </Link>
          </>
        ) : (
          <button className="button primary" onClick={enter} disabled={busy || !store.ready}>
            {busy ? 'Preparing your demo…' : 'Enter demo account'}
            <ArrowRight size={18} />
          </button>
        )}
        <Link className="text-link" href="/shop">
          Explore the store
        </Link>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <div className="demo-steps">
        <div>
          <h2>Make it your room.</h2>
          <p>
            Save a few pieces, choose their finishes, and add them to your bag. Your choices persist
            across refreshes.
          </p>
        </div>
        <div>
          <h2>Try a complete checkout.</h2>
          <p>
            Use fictional delivery details and choose a successful or declined payment. Your demo
            order and its inventory changes are saved.
          </p>
        </div>
        <div>
          <h2>Change your perspective.</h2>
          <p>
            Open the merchant view to manage your orders, catalog, stock and inquiries. Your changes
            affect only your workspace.
          </p>
        </div>
      </div>
      <p className="small muted">
        Your demo is saved only in this browser. Tabs on this site share it; other browsers and
        devices do not. Clearing site data or resetting the demo removes it. There is no login or
        server database. No emails are sent.
      </p>
      {(store.hasWorkspace || store.storageError) && (
        <div className="reset-zone">
          <h2>Start with a clean room.</h2>
          <p className="muted">
            Reset your bag, saved pieces, orders, inquiries and catalog changes. Other visitors’
            workspaces are unaffected.
          </p>
          <button className="text-link" onClick={() => setReset(true)}>
            Reset my demo workspace
          </button>
        </div>
      )}
      <Dialog open={reset} onClose={() => setReset(false)} title="Reset your demo?">
        <div className="inquiry-body">
          <p>
            This clears all orders, bag items, saved pieces, inquiries, addresses and merchant
            changes in your current workspace. The original collection and sample profile will be
            restored.
          </p>
          <button className="button primary full" disabled={busy} onClick={doReset}>
            {busy ? 'Resetting…' : 'Confirm reset of my workspace'}
          </button>
          <button className="text-link full center" onClick={() => setReset(false)}>
            Keep my demo
          </button>
        </div>
      </Dialog>
    </div>
  );
}
