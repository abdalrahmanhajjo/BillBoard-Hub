import { z } from 'zod';

/** RFC 5321 caps an address at 254 characters. */
const EMAIL_MAX_LENGTH = 254;

export const emailSchema = z
  .email('Enter a valid email address, like name@company.com.')
  .max(EMAIL_MAX_LENGTH, 'That email address is too long.')
  .trim()
  .toLowerCase();

/**
 * Accepts any script's letters plus the separators that legitimately appear in
 * names (spaces, hyphens, apostrophes, periods) while rejecting digits and the
 * symbols that only show up in pasted junk.
 */
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}'\-. ]*$/u;

export function personNameSchema(label: string) {
  return z
    .string()
    .trim()
    .min(2, `Enter a ${label} with at least 2 characters.`)
    .max(50, `Keep the ${label} under 50 characters.`)
    .regex(
      NAME_PATTERN,
      `A ${label} can only contain letters, spaces, hyphens, apostrophes, and periods.`,
    );
}
