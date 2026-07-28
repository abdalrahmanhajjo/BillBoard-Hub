import { z } from 'zod';
import { emailSchema } from '@/shared/contracts/auth/identity.schema';
import { PASSWORD_MAX_LENGTH } from '@/shared/contracts/auth/password.schema';

export const loginSchema = z.object({
  email: emailSchema,
  // Sign-in deliberately checks presence only. Strength rules belong to
  // registration and reset: enforcing them here would lock out accounts created
  // before a policy change and would leak the current policy to attackers.
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(PASSWORD_MAX_LENGTH, 'That password is too long.'),
});

export type LoginSchemaInput = z.input<typeof loginSchema>;
export type LoginSchemaOutput = z.output<typeof loginSchema>;
