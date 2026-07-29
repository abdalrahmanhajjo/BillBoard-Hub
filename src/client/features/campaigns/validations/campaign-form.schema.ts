import { z } from 'zod';

export const campaignFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Campaign name is required.')
      .max(200, 'Campaign name is too long.'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description is too long.')
      .optional()
      .or(z.literal('')),
    startDate: z.string().min(1, 'Start date is required.'),
    endDate: z.string().min(1, 'End date is required.'),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'Start date must be before end date.',
    path: ['endDate'],
  });

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
