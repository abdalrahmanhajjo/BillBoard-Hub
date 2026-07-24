import { z } from 'zod';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES, DIMENSION_UNITS } from '@/shared/constants/billboard';

export const billboardLocationSchema = z.object({
  address: z.string().trim().min(2, 'Address is required.'),
  city: z.string().trim().min(2, 'City is required.'),
  country: z.string().trim().min(2, 'Country is required.'),
});

export const billboardDimensionsSchema = z.object({
  width: z.coerce.number().positive('Width must be greater than 0.'),
  height: z.coerce.number().positive('Height must be greater than 0.'),
  unit: z.enum(DIMENSION_UNITS),
});

export const createBillboardSchema = z.object({
  name: z.string().trim().min(2, 'Billboard name is required.'),
  code: z.string().trim().min(2, 'Billboard code is required.'),
  description: z.string().trim().max(1000, 'Description is too long.').optional(),
  type: z.enum(BILLBOARD_TYPES),
  location: billboardLocationSchema,
  dimensions: billboardDimensionsSchema,
  monthlyPrice: z.coerce.number().positive('Monthly price must be greater than 0.'),
  trafficCount: z.coerce
    .number()
    .int('Traffic count must be a whole number.')
    .nonnegative('Traffic count cannot be negative.')
    .optional(),
  status: z.enum(BILLBOARD_STATUSES).default(BILLBOARD_STATUSES.AVAILABLE),
  images: z.array(z.url('Each image must be a valid URL.')).default([]),
});

export const updateBillboardSchema = z
  .object({
    description: z.string().trim().max(1000, 'Description is too long.').optional(),
    monthlyPrice: z.coerce.number().positive('Monthly price must be greater than 0.').optional(),
    trafficCount: z.coerce
      .number()
      .int('Traffic count must be a whole number.')
      .nonnegative('Traffic count cannot be negative.')
      .optional(),
    location: billboardLocationSchema.optional(),
    images: z.array(z.url('Each image must be a valid URL.')).optional(),
    status: z.enum(BILLBOARD_STATUSES).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided.',
  });

export type CreateBillboardSchemaInput = z.input<typeof createBillboardSchema>;
export type CreateBillboardSchemaOutput = z.output<typeof createBillboardSchema>;
export type UpdateBillboardSchemaInput = z.input<typeof updateBillboardSchema>;
export type UpdateBillboardSchemaOutput = z.output<typeof updateBillboardSchema>;
