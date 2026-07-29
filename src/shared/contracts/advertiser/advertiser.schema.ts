import { z } from 'zod';

/**
 * The advertiser profile: the commercial identity behind an account. Kept
 * separate from the user record because it describes the organization, not the
 * person signing in, and because operators reviewing a booking need it.
 */
const companyNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter a company name with at least 2 characters.')
  .max(120, 'Keep the company name under 120 characters.');

/**
 * Digits with the separators real numbers are written with. Deliberately not a
 * strict E.164 check: advertisers are international and a rejected valid number
 * costs more than a loosely formatted one.
 */
const PHONE_PATTERN = /^\+?[\d\s().-]{6,}$/;

const phoneSchema = z
  .string()
  .trim()
  .min(6, 'Enter a phone number we can reach you on.')
  .max(32, 'Keep the phone number under 32 characters.')
  .regex(PHONE_PATTERN, 'A phone number can only contain digits, spaces, and + ( ) - characters.');

const addressSchema = z
  .string()
  .trim()
  .min(6, 'Enter the full business address, including the street.')
  .max(200, 'Keep the address under 200 characters.');

export const createAdvertiserSchema = z.object({
  companyName: companyNameSchema,
  phone: phoneSchema,
  address: addressSchema,
});

export const updateAdvertiserSchema = createAdvertiserSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Change at least one profile field before saving.',
  });

export type CreateAdvertiserSchemaInput = z.input<typeof createAdvertiserSchema>;
export type CreateAdvertiserSchemaOutput = z.output<typeof createAdvertiserSchema>;
export type UpdateAdvertiserSchemaInput = z.input<typeof updateAdvertiserSchema>;
