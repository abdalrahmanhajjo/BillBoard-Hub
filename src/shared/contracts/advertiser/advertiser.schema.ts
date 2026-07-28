import { z } from 'zod';

export const createAdvertiserSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
});

export const updateAdvertiserSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required.').optional(),
    phone: z.string().min(1, 'Phone number is required.').optional(),
    address: z.string().min(1, 'Address is required.').optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0 && Object.values(data).some((v) => v !== undefined),
    {
      message: 'At least one field must be provided for update.',
    },
  );

export type CreateAdvertiserSchemaInput = z.input<typeof createAdvertiserSchema>;
export type UpdateAdvertiserSchemaInput = z.input<typeof updateAdvertiserSchema>;
