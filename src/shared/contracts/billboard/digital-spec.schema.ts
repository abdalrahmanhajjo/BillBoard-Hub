import { z } from 'zod';
import { SCREEN_STATUSES } from '@/shared/constants/billboard';

export const digitalSpecResolutionSchema = z.object({
  width: z.coerce.number().int().positive('Resolution width must be greater than 0.'),
  height: z.coerce.number().int().positive('Resolution height must be greater than 0.'),
});

export const upsertDigitalSpecSchema = z.object({
  resolution: digitalSpecResolutionSchema,
  brightness: z.coerce.number().positive('Brightness must be greater than 0.'),
  slotDurationSeconds: z.coerce.number().positive('Slot duration must be greater than 0.'),
  rotatingAdsCount: z.coerce.number().int().min(1, 'There must be at least one rotating ad.'),
  screenStatus: z.enum(SCREEN_STATUSES),
});

export type UpsertDigitalSpecSchemaInput = z.input<typeof upsertDigitalSpecSchema>;
export type UpsertDigitalSpecSchemaOutput = z.output<typeof upsertDigitalSpecSchema>;
