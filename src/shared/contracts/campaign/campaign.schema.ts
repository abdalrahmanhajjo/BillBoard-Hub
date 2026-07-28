import { z } from 'zod';
import { CAMPAIGN_STATUSES } from '@/shared/constants/campaign';

export const createCampaignSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Campaign name is required.')
      .max(200, 'Campaign name is too long.'),
    description: z.string().trim().max(2000, 'Description is too long.').optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Start date must be before end date.',
    path: ['endDate'],
  });

export const updateCampaignSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Campaign name is required.')
      .max(200, 'Campaign name is too long.')
      .optional(),
    description: z.string().trim().max(2000, 'Description is too long.').optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided.',
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate < data.endDate, {
    message: 'Start date must be before end date.',
    path: ['endDate'],
  });

export type CreateCampaignSchemaInput = z.input<typeof createCampaignSchema>;
export type CreateCampaignSchemaOutput = z.output<typeof createCampaignSchema>;
export type UpdateCampaignSchemaInput = z.input<typeof updateCampaignSchema>;
export type UpdateCampaignSchemaOutput = z.output<typeof updateCampaignSchema>;
