import { z } from 'zod';
import { AD_CREATIVE_TYPES } from '@/shared/constants/ad-creative';

export const createAdCreativeSchema = z.object({
  campaignId: z.string().min(1, 'Campaign id is required.'),
  url: z.url('A valid file URL is required.'),
  fileType: z.enum(AD_CREATIVE_TYPES),
});

export const updateAdCreativeSchema = z
  .object({
    campaignId: z.string().min(1, 'Campaign id is required.').optional(),
    url: z.url('A valid file URL is required.').optional(),
    fileType: z.enum(AD_CREATIVE_TYPES).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0 && Object.values(data).some((v) => v !== undefined),
    {
      message: 'At least one field must be provided for update.',
    },
  );

export type CreateAdCreativeSchemaInput = z.input<typeof createAdCreativeSchema>;
export type UpdateAdCreativeSchemaInput = z.input<typeof updateAdCreativeSchema>;
