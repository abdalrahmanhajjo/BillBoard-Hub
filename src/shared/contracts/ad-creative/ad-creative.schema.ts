import { z } from 'zod';
import { AD_CREATIVE_TYPES } from '@/shared/constants/ad-creative';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB

export const createAdCreativeSchema = z
  .object({
    campaignId: z.string().min(1, 'Campaign id is required.'),
    url: z.url('A valid file URL is required.'),
    fileType: z.enum(AD_CREATIVE_TYPES),
    durationSeconds: z.coerce.number().positive().optional(),
    fileSizeBytes: z.coerce.number().positive().optional(),
  })
  .refine((data) => data.fileType !== 'video' || data.durationSeconds !== undefined, {
    message: 'Duration is required for video creatives.',
    path: ['durationSeconds'],
  })
  .refine(
    (data) =>
      data.fileSizeBytes === undefined ||
      (data.fileType === 'image' && data.fileSizeBytes <= MAX_IMAGE_BYTES) ||
      (data.fileType === 'video' && data.fileSizeBytes <= MAX_VIDEO_BYTES),
    { message: 'File exceeds the maximum allowed size.', path: ['fileSizeBytes'] },
  );

export type CreateAdCreativeSchemaInput = z.input<typeof createAdCreativeSchema>;
export type CreateAdCreativeSchemaOutput = z.output<typeof createAdCreativeSchema>;
