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
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid start date.',
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid end date.',
    }),
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
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid start date.',
      })
      .optional(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid end date.',
      })
      .optional(),
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
export type UpdateCampaignSchemaInput = z.input<typeof updateCampaignSchema>;
