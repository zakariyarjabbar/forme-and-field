import { z } from 'zod';
export const addressSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(100),
  email: z.email('Enter a valid email address.').max(254),
  line1: z.string().trim().min(3, 'Enter your street address.').max(200),
  line2: z.string().trim().max(200).default(''),
  city: z.string().trim().min(2, 'Enter a city.').max(100),
  region: z.string().trim().max(100).default(''),
  postal: z.string().trim().min(2, 'Enter a postal code.').max(20),
  country: z.string().trim().min(2, 'Choose a country.').max(80),
});
export const quantitySchema = z.number().int().min(1).max(20);
export const checkoutSchema = z.object({
  key: z.uuid(),
  delivery: z.enum(['standard', 'white-glove']),
  scenario: z.enum(['success', 'decline']),
  address: addressSchema,
  expectedTotal: z.number().int().nonnegative(),
});
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  topic: z.enum(['Product question', 'Delivery question', 'Trade inquiry', 'Something else']),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(4000),
});
export const productSchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  category: z.enum(['Seating', 'Tables', 'Lighting', 'Storage', 'Objects']),
  short: z.string().trim().min(3).max(180),
  description: z.string().trim().min(20).max(4000),
  material: z.string().min(2).max(100),
  width: z.number().positive().max(1000),
  depth: z.number().positive().max(1000),
  height: z.number().positive().max(1000),
  care: z.string().min(5).max(2000),
  delivery: z.string().min(5).max(200),
  image: z.string().max(200),
  variants: z
    .array(
      z.object({
        id: z.string().max(100).optional(),
        sku: z.string().trim().min(3).max(100),
        name: z.string().trim().min(2).max(100),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        price: z.number().int().nonnegative().max(100000000),
        stock: z.number().int().nonnegative().max(100000),
      }),
    )
    .min(1)
    .max(12),
});
