import { z } from 'zod';
import { emailSchema } from '@/shared/contracts/auth/identity.schema';
import { strongPasswordSchema } from '@/shared/contracts/auth/password.schema';

const INVALID_TOKEN_MESSAGE = 'This reset link is incomplete. Request a new one to continue.';

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Tokens are 32 random bytes rendered as base64url, so the shape is known and
 * anything else can be rejected before it reaches the database.
 */
export const resetTokenSchema = z
  .string()
  .trim()
  .min(20, INVALID_TOKEN_MESSAGE)
  .max(256, INVALID_TOKEN_MESSAGE)
  .regex(/^[A-Za-z0-9_-]+$/, INVALID_TOKEN_MESSAGE);

export const resetPasswordSchema = z
  .object({
    token: resetTokenSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Re-enter your password to confirm it.'),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Both passwords must match.',
      });
    }
  });

export type ForgotPasswordSchemaInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordSchemaOutput = z.output<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaInput = z.input<typeof resetPasswordSchema>;
export type ResetPasswordSchemaOutput = z.output<typeof resetPasswordSchema>;
