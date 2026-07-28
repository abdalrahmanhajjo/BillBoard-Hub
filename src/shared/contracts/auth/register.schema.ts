import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.');

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Enter a first name with at least 2 characters.'),
    lastName: z.string().trim().min(2, 'Enter a last name with at least 2 characters.'),
    email: z.email('Please enter a valid email address.').trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type RegisterSchemaInput = z.input<typeof registerSchema>;
