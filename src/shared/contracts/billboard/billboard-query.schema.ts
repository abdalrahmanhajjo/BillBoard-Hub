import { z } from 'zod';
import { BILLBOARD_STATUSES, BILLBOARD_TYPES } from '@/shared/constants/billboard';

export const billboardQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(200).optional(),
    type: z.enum(BILLBOARD_TYPES).optional(),
    city: z.string().trim().min(1).max(200).optional(),
    status: z.enum(BILLBOARD_STATUSES).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined || data.maxPrice === undefined || data.minPrice <= data.maxPrice,
    { message: 'minPrice must be less than or equal to maxPrice.', path: ['minPrice'] },
  );

export type BillboardQuerySchemaInput = z.input<typeof billboardQuerySchema>;
export type BillboardQuerySchemaOutput = z.output<typeof billboardQuerySchema>;
