import { z } from 'zod';
import { BILLBOARD_STATUSES } from '@/shared/constants/billboard';

export const updateAvailabilitySchema = z.object({
  status: z.enum(BILLBOARD_STATUSES),
});

export type UpdateAvailabilitySchemaInput = z.input<typeof updateAvailabilitySchema>;
