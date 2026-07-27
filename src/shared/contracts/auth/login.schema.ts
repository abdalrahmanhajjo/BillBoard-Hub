import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address.').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.'),
});

export type LoginSchemaInput = z.input<typeof loginSchema>;
