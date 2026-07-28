import { z } from 'zod';
import {
  CREATIVE_STATUSES,
  CREATIVE_TYPES,
  MAX_CREATIVE_VIDEO_DURATION_SECONDS,
} from '@/shared/constants/creative';

const secureAssetUrl = z
  .string()
  .trim()
  .max(2048, 'Asset URL must be 2,048 characters or fewer.')
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'The creative asset must be a secure (https) URL.');

const videoDuration = z.coerce
  .number()
  .positive('Duration must be greater than 0.')
  .refine(
    (value) => value < MAX_CREATIVE_VIDEO_DURATION_SECONDS,
    `Video must be shorter than ${MAX_CREATIVE_VIDEO_DURATION_SECONDS} seconds.`,
  );

export const createCreativeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Enter a creative name.')
      .max(120, 'Creative name must be 120 characters or fewer.'),
    type: z.enum(CREATIVE_TYPES),
    assetUrl: secureAssetUrl,
    durationSeconds: videoDuration.optional(),
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
      .min(2, 'Enter a creative name.')
      .max(120, 'Creative name must be 120 characters or fewer.')
      .optional(),
    durationSeconds: videoDuration.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Change the creative name or duration before saving.',
  });

export const updateCreativeStatusSchema = z.object({
  status: z.enum([CREATIVE_STATUSES.APPROVED, CREATIVE_STATUSES.REJECTED]),
});

export type CreateCreativeSchemaInput = z.input<typeof createCreativeSchema>;
export type CreateCreativeSchemaOutput = z.output<typeof createCreativeSchema>;
export type UpdateCreativeSchemaInput = z.input<typeof updateCreativeSchema>;
export type UpdateCreativeSchemaOutput = z.output<typeof updateCreativeSchema>;
export type UpdateCreativeStatusSchemaInput = z.input<typeof updateCreativeStatusSchema>;
