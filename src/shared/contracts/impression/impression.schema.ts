import { z } from 'zod';

const isoDateTime = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'A valid date and time is required.');

/**
 * Payload a screen posts when a creative plays. `billboardId` comes from the
 * route, not the body, so a device cannot report impressions for other screens.
 */
export const recordImpressionSchema = z.object({
  creativeId: z.string().trim().min(1, 'A creative id is required.'),
  playlistId: z.string().trim().min(1, 'A playlist id is required.'),
  scheduleId: z.string().trim().min(1, 'Schedule id is invalid.').optional(),
  occurredAt: isoDateTime.optional(),
});

export type RecordImpressionSchemaInput = z.input<typeof recordImpressionSchema>;
export type RecordImpressionSchemaOutput = z.output<typeof recordImpressionSchema>;
