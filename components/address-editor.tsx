'use client';
import { useState, type FormEvent } from 'react';
import type { Address } from '@/lib/types';
import { addressSchema } from '@/lib/validation';
import { AddressFields } from './address-fields';
import { Dialog } from './dialog';
import { useStore } from './store-provider';
export function AddressEditor({ address, id }: { address?: Address; id?: string }) {
  const store = useStore(),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const result = addressSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(' '));
      return;
    }
    setBusy(true);
    try {
      await store.mutate({ action: 'address', data: result.data, id });
      setOpen(false);
      store.notify('Your demo address has been saved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="text-link" onClick={() => setOpen(true)}>
        {id ? 'Edit address' : 'Add a demo address'}
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={id ? 'Edit your address' : 'A new address'}
      >
        <form className="admin-form" onSubmit={save}>
          <AddressFields address={address} />
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" style={{ marginTop: 25 }} disabled={busy}>
            {busy ? 'Saving…' : 'Save address'}
          </button>
        </form>
      </Dialog>
    </>
  );
}
