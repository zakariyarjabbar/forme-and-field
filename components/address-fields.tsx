'use client';
import type { Address } from '@/lib/types';
export function AddressFields({
  address,
  errors = {},
}: {
  address?: Partial<Address>;
  errors?: Record<string, string>;
}) {
  return (
    <div className="form-grid">
      {[
        ['name', 'Full name', 'name', 'text'],
        ['email', 'Email address', 'email', 'email'],
        ['line1', 'Street address', 'address-line1', 'text'],
        ['line2', 'Apartment, suite, etc. (optional)', 'address-line2', 'text'],
        ['city', 'City', 'address-level2', 'text'],
        ['region', 'State / region (optional)', 'address-level1', 'text'],
        ['postal', 'Postal code', 'postal-code', 'text'],
      ].map(([name, label, complete, type]) => (
        <label key={name} className={`field ${['line1', 'line2'].includes(name) ? 'span-2' : ''}`}>
          {label}
          <input
            name={name}
            type={type}
            autoComplete={complete}
            defaultValue={address?.[name as keyof Address] ?? ''}
            required={!['line2', 'region'].includes(name)}
            maxLength={name === 'email' ? 254 : 200}
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? `error-${name}` : undefined}
          />
          {errors[name] && (
            <span id={`error-${name}`} className="error-text" style={{ padding: 0 }}>
              {errors[name]}
            </span>
          )}
        </label>
      ))}
      <label className="field">
        Country
        <select
          name="country"
          defaultValue={address?.country || 'United States'}
          autoComplete="country-name"
        >
          {[
            'United States',
            'United Kingdom',
            'Canada',
            'Australia',
            'Germany',
            'France',
            'Netherlands',
            'Iraq',
            'United Arab Emirates',
            'Other demo destination',
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
