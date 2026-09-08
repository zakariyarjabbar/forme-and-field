'use client';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { inquirySchema } from '@/lib/validation';
import { useStore } from './store-provider';
export function ContactForm() {
  const store = useStore(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const form = e.currentTarget,
      data = Object.fromEntries(new FormData(form)),
      parsed = inquirySchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(' '));
      return;
    }
    setBusy(true);
    try {
      const result = await store.mutate({ action: 'inquiry', data: parsed.data });
      setSuccess(
        result.duplicate
          ? 'This inquiry is already saved in this browser.'
          : 'Your inquiry has been saved only in this browser. A local acknowledgment is ready in the merchant outbox.',
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <label className="field">
          Your name
          <input name="name" autoComplete="name" required minLength={2} maxLength={100} />
        </label>
        <label className="field">
          Email address
          <input type="email" name="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="field span-2">
          What’s on your mind?
          <select name="topic">
            <option>Product question</option>
            <option>Delivery question</option>
            <option>Trade inquiry</option>
            <option>Something else</option>
          </select>
        </label>
        <label className="field span-2">
          Your message
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={4000}
            placeholder="Tell us about the piece or space you’re considering."
          />
        </label>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {success && (
        <div className="success-message" role="status">
          <Check size={20} />
          <p>{success}</p>
        </div>
      )}
      <div className="form-actions">
        <p className="small muted">
          Demo form. Your inquiry is stored locally; no external email is sent.
        </p>
        <button className="button primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save demo inquiry'}
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
