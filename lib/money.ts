import type { DeliveryMethod } from './types';
export function money(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
}
export function pricing(
  lines: { price: number; quantity: number }[],
  delivery: DeliveryMethod = 'standard',
) {
  if (!['standard', 'white-glove'].includes(delivery))
    throw new Error('Choose a valid delivery method.');
  for (const line of lines) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 20)
      throw new Error('Quantity must be a whole number from 1 to 20.');
    if (!Number.isSafeInteger(line.price) || line.price < 0 || line.price > 100000000)
      throw new Error('Invalid catalog price.');
  }
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  if (!Number.isSafeInteger(subtotal)) throw new Error('Order total is too large.');
  const shipping =
    lines.length === 0 ? 0 : delivery === 'white-glove' ? 15000 : subtotal >= 150000 ? 0 : 7500;
  return { subtotal, shipping, tax: 0, total: subtotal + shipping };
}
