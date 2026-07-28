import { z } from 'zod';
import { emailSchema, personNameSchema } from '@/shared/contracts/auth/identity.schema';
import {
  containsIdentityToken,
  strongPasswordSchema,
} from '@/shared/contracts/auth/password.schema';

export const registerSchema = z
  .object({
    firstName: personNameSchema('first name'),
    lastName: personNameSchema('last name'),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Re-enter your password to confirm it.'),
    acceptTerms: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Both passwords must match.',
      });
    }

    const emailHandle = value.email.split('@')[0] ?? '';
    if (containsIdentityToken(value.password, [value.firstName, value.lastName, emailHandle])) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Your password cannot contain your name or email address.',
      });
    }

    if (!value.acceptTerms) {
      ctx.addIssue({
        code: 'custom',
        path: ['acceptTerms'],
        message: 'Accept the Terms of Service and Privacy Policy to continue.',
      });
    }
  });

export type RegisterSchemaInput = z.input<typeof registerSchema>;
export type RegisterSchemaOutput = z.output<typeof registerSchema>;
