import { z } from 'zod';
import { USER_ROLES } from '@/shared/constants/user-roles';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.');

export const createUserSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Enter a first name with at least 2 characters.'),
    lastName: z.string().trim().min(2, 'Enter a last name with at least 2 characters.'),
    email: z.email('Please enter a valid email address.').trim().toLowerCase(),
    role: z.enum(USER_ROLES),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const updateUserInfoSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'Enter a first name with at least 2 characters.')
      .optional(),
    lastName: z.string().trim().min(2, 'Enter a last name with at least 2 characters.').optional(),
    email: z.email('Please enter a valid email address.').trim().toLowerCase().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0 && Object.values(data).some((v) => v !== undefined),
    {
      message: 'Change at least one profile field before saving.',
    },
  );

export type UpdateUserInfoSchemaInput = z.input<typeof updateUserInfoSchema>;
export type CreateUserSchemaInput = z.input<typeof createUserSchema>;
