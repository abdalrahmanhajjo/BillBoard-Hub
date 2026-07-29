import { z } from 'zod';
import { USER_ROLES } from '@/shared/constants/user-roles';

/**
 * The access half of a user record — what an admin changes from the user
 * directory. Kept apart from `updateUserInfoSchema` on purpose: name and email
 * are a person editing their own profile, while role and activation are an
 * administrator changing what an account may do.
 */
export const updateUserAccessSchema = z
  .object({
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: 'Choose a role or an activation state to change.',
  });

export type UpdateUserAccessSchemaInput = z.input<typeof updateUserAccessSchema>;
export type UpdateUserAccessSchemaOutput = z.output<typeof updateUserAccessSchema>;
