import { z } from 'zod';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES, DIMENSION_UNITS } from '@/shared/constants/billboard';

const lebanonCountrySchema = z
  .string()
  .trim()
  .refine((country) => country.toLocaleLowerCase('en') === 'lebanon', {
    message: 'Billboard inventory is currently limited to Lebanon.',
  })
  .transform(() => 'Lebanon');

const billboardImageSchema = z
  .string()
  .trim()
  .max(2048, 'Image URL must be 2,048 characters or fewer.')
  .refine(
    (value) =>
      /^\/(?!\/)[^\s]*$/.test(value) ||
      (() => {
        try {
          const url = new URL(value);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      })(),
    'Each image must be a local path or a secure URL.',
  );

const billboardLocationSchema = z.object({
  address: z
    .string()
    .trim()
    .min(2, 'Enter the billboard address.')
    .max(180, 'Address must be 180 characters or fewer.'),
  city: z.string().trim().min(2, 'Enter the city.').max(80, 'City must be 80 characters or fewer.'),
  country: lebanonCountrySchema,
});

const billboardDimensionsSchema = z.object({
  width: z.coerce.number().positive('Width must be greater than 0.'),
  height: z.coerce.number().positive('Height must be greater than 0.'),
  unit: z.enum(DIMENSION_UNITS),
});

export const createBillboardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter a billboard name.')
    .max(120, 'Billboard name must be 120 characters or fewer.'),
  code: z
    .string()
    .trim()
    .min(2, 'Enter a billboard code.')
    .max(40, 'Billboard code must be 40 characters or fewer.')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
      'Code can contain letters, numbers, dashes, and underscores.',
    )
    .transform((code) => code.toUpperCase()),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1,000 characters or fewer.')
    .optional(),
  type: z.enum(BILLBOARD_TYPES),
  location: billboardLocationSchema,
  dimensions: billboardDimensionsSchema,
  monthlyPrice: z.coerce.number().positive('Monthly price must be greater than 0.'),
  trafficCount: z.coerce
    .number()
    .int('Traffic count must be a whole number.')
    .positive('Monthly traffic must be greater than 0.'),
  status: z.enum(BILLBOARD_STATUSES).default(BILLBOARD_STATUSES.AVAILABLE),
  images: z
    .array(billboardImageSchema)
    .max(12, 'A billboard can have up to 12 images.')
    .default([]),
});

export const updateBillboardSchema = z
  .object({
    description: z
      .string()
      .trim()
      .max(1000, 'Description must be 1,000 characters or fewer.')
      .optional(),
    monthlyPrice: z.coerce.number().positive('Monthly price must be greater than 0.').optional(),
    trafficCount: z.coerce
      .number()
      .int('Traffic count must be a whole number.')
      .positive('Monthly traffic must be greater than 0.')
      .optional(),
    location: billboardLocationSchema.optional(),
    images: z
      .array(billboardImageSchema)
      .max(12, 'A billboard can have up to 12 images.')
      .optional(),
    status: z.enum(BILLBOARD_STATUSES).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Change at least one billboard field before saving.',
  });

export type CreateBillboardSchemaInput = z.input<typeof createBillboardSchema>;
export type CreateBillboardSchemaOutput = z.output<typeof createBillboardSchema>;
export type UpdateBillboardSchemaInput = z.input<typeof updateBillboardSchema>;
export type UpdateBillboardSchemaOutput = z.output<typeof updateBillboardSchema>;
