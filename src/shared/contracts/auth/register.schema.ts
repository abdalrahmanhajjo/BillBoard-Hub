import { z } from 'zod';
import { emailSchema, personNameSchema } from '@/shared/contracts/auth/identity.schema';
import {
  containsIdentityToken,
  strongPasswordSchema,
} from '@/shared/contracts/auth/password.schema';
import { createAdvertiserSchema } from '@/shared/contracts/advertiser/advertiser.schema';

/**
 * Registration is collected over two steps, so the fields exist as three
 * schemas: one per step for validating a step in isolation, and the combined
 * payload the API accepts. Keeping the shapes in one place means a step can
 * never drift from what the endpoint requires.
 */
const accountShape = {
  firstName: personNameSchema('first name'),
  lastName: personNameSchema('last name'),
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Re-enter your password to confirm it.'),
  acceptTerms: z.boolean(),
};

type AccountValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

/**
 * Shared by the step-one schema and the combined one so the cross-field rules
 * are enforced identically whether a step or the whole payload is validated.
 */
function refineAccount(value: AccountValues, ctx: z.RefinementCtx): void {
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
}

/** Step one — who is signing up. */
export const registerAccountSchema = z.object(accountShape).superRefine(refineAccount);

/**
 * Step two — the advertiser profile. Reuses the advertiser contract directly so
 * a profile created at registration cannot diverge from one created later.
 */
export const registerCompanySchema = createAdvertiserSchema;

/** What POST /auth/register accepts: both steps in one payload. */
export const registerSchema = z
  .object({ ...accountShape, ...createAdvertiserSchema.shape })
  .superRefine(refineAccount);

export type RegisterAccountSchemaInput = z.input<typeof registerAccountSchema>;
export type RegisterCompanySchemaInput = z.input<typeof registerCompanySchema>;
export type RegisterSchemaInput = z.input<typeof registerSchema>;
export type RegisterSchemaOutput = z.output<typeof registerSchema>;
