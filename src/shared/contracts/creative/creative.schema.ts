import { z } from 'zod';
import { CREATIVE_STATUSES, CREATIVE_TYPES } from '@/shared/constants/creative';

const secureAssetUrl = z
  .string()
  .trim()
  .max(2048, 'Asset URL is too long.')
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'The creative asset must be a secure (https) URL.');

export const createCreativeSchema = z
  .object({
    name: z.string().trim().min(2, 'Creative name is required.').max(120, 'Name is too long.'),
    type: z.enum(CREATIVE_TYPES),
    assetUrl: secureAssetUrl,
    durationSeconds: z.coerce
      .number()
      .int('Duration must be a whole number of seconds.')
      .positive('Duration must be greater than 0.')
      .max(600, 'Duration is too long.')
      .optional(),
  })
  .refine((data) => data.type !== CREATIVE_TYPES.VIDEO || data.durationSeconds !== undefined, {
    message: 'Video creatives require a duration.',
    path: ['durationSeconds'],
  });

export const updateCreativeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Creative name is required.')
      .max(120, 'Name is too long.')
      .optional(),
    durationSeconds: z.coerce
      .number()
      .int('Duration must be a whole number of seconds.')
      .positive('Duration must be greater than 0.')
      .max(600, 'Duration is too long.')
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided.',
  });

export const updateCreativeStatusSchema = z.object({
  status: z.enum([CREATIVE_STATUSES.APPROVED, CREATIVE_STATUSES.REJECTED]),
});

export type CreateCreativeSchemaInput = z.input<typeof createCreativeSchema>;
export type CreateCreativeSchemaOutput = z.output<typeof createCreativeSchema>;
export type UpdateCreativeSchemaInput = z.input<typeof updateCreativeSchema>;
export type UpdateCreativeSchemaOutput = z.output<typeof updateCreativeSchema>;
export type UpdateCreativeStatusSchemaInput = z.input<typeof updateCreativeStatusSchema>;
