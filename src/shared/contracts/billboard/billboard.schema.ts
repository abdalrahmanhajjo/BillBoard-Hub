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
  .max(2048, 'Image path is too long.')
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

export const billboardLocationSchema = z.object({
  address: z.string().trim().min(2, 'Address is required.').max(180, 'Address is too long.'),
  city: z.string().trim().min(2, 'City is required.').max(80, 'City is too long.'),
  country: lebanonCountrySchema,
});

export const billboardDimensionsSchema = z.object({
  width: z.coerce.number().positive('Width must be greater than 0.'),
  height: z.coerce.number().positive('Height must be greater than 0.'),
  unit: z.enum(DIMENSION_UNITS),
});

export const createBillboardSchema = z.object({
  name: z.string().trim().min(2, 'Billboard name is required.').max(120, 'Name is too long.'),
  code: z
    .string()
    .trim()
    .min(2, 'Billboard code is required.')
    .max(40, 'Code is too long.')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
      'Code can contain letters, numbers, dashes, and underscores.',
    )
    .transform((code) => code.toUpperCase()),
  description: z.string().trim().max(1000, 'Description is too long.').optional(),
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
    description: z.string().trim().max(1000, 'Description is too long.').optional(),
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
    message: 'At least one field must be provided.',
  });

export type CreateBillboardSchemaInput = z.input<typeof createBillboardSchema>;
export type CreateBillboardSchemaOutput = z.output<typeof createBillboardSchema>;
export type UpdateBillboardSchemaInput = z.input<typeof updateBillboardSchema>;
export type UpdateBillboardSchemaOutput = z.output<typeof updateBillboardSchema>;
