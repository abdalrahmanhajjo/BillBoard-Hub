import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRule = {
  id: string;
  /** Shown in the browser checklist. */
  label: string;
  /** Shown as the field error when this is the first unmet required rule. */
  message: string;
  /** Required rules block submission; optional rules only raise the strength score. */
  required: boolean;
  test: (value: string) => boolean;
};

/**
 * Single source of truth for the password policy.
 *
 * `strongPasswordSchema` rejects on these rules and the browser strength meter
 * renders the same list, so the checklist a user sees can never drift from what
 * the server actually accepts.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    message: `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
    required: true,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    message: 'Add at least one lowercase letter.',
    required: true,
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    message: 'Add at least one uppercase letter.',
    required: true,
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    message: 'Add at least one number.',
    required: true,
    test: (value) => /\d/.test(value),
  },
  {
    id: 'symbol',
    label: 'One symbol (recommended)',
    message: 'Add at least one symbol.',
    required: false,
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

/**
 * Highest-traffic guesses from public credential-stuffing lists. A short deny
 * list is not a substitute for a breach corpus, but it cheaply blocks the
 * passwords that satisfy every composition rule and still fall in seconds.
 */
const COMMON_PASSWORDS = new Set([
  'password1',
  'password12',
  'password123',
  'passw0rd1',
  'passw0rd123',
  'qwerty123',
  'qwerty1234',
  'iloveyou1',
  'admin1234',
  'welcome1',
  'welcome123',
  'letmein123',
  'abcd1234',
  'abc12345',
  'football1',
  'monkey123',
  'sunshine1',
  'princess1',
  'billboard1',
  'boardly123',
  'changeme1',
  'test1234',
]);

export function isCommonPassword(value: string): boolean {
  return COMMON_PASSWORDS.has(value.toLowerCase());
}

export const PASSWORD_STRENGTH_LABELS = [
  'Very weak',
  'Weak',
  'Fair',
  'Strong',
  'Excellent',
] as const;

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;
export type PasswordStrengthLabel = (typeof PASSWORD_STRENGTH_LABELS)[number];

export type PasswordStrength = {
  score: PasswordStrengthScore;
  label: PasswordStrengthLabel;
  satisfiedRuleIds: string[];
  /** True only when the value would also pass `strongPasswordSchema`. */
  meetsPolicy: boolean;
};

export function scorePassword(value: string): PasswordStrength {
  const satisfiedRuleIds = PASSWORD_RULES.filter((rule) => rule.test(value)).map((rule) => rule.id);
  const meetsPolicy =
    value.length > 0 &&
    value.length <= PASSWORD_MAX_LENGTH &&
    value === value.trim() &&
    !isCommonPassword(value) &&
    PASSWORD_RULES.every((rule) => !rule.required || satisfiedRuleIds.includes(rule.id));

  if (!value || isCommonPassword(value)) {
    return {
      score: 0,
      label: PASSWORD_STRENGTH_LABELS[0],
      satisfiedRuleIds,
      meetsPolicy: false,
    };
  }

  // Length is the strongest single signal, so a long password earns a step on
  // top of the composition rules it satisfies.
  const lengthBonus = value.length >= 14 ? 1 : 0;
  const score = Math.min(
    Math.max(satisfiedRuleIds.length - 1, 0) + lengthBonus,
    4,
  ) as PasswordStrengthScore;

  return { score, label: PASSWORD_STRENGTH_LABELS[score], satisfiedRuleIds, meetsPolicy };
}

/**
 * Emits at most one issue, in rule order, so the field shows the single next
 * thing to fix rather than a wall of simultaneous complaints.
 */
export const strongPasswordSchema = z.string().superRefine((value, ctx) => {
  if (value.length > PASSWORD_MAX_LENGTH) {
    ctx.addIssue({
      code: 'custom',
      message: `Use at most ${PASSWORD_MAX_LENGTH} characters.`,
    });
    return;
  }

  if (value !== value.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Remove the space at the start or end of your password.',
    });
    return;
  }

  const unmetRule = PASSWORD_RULES.find((rule) => rule.required && !rule.test(value));
  if (unmetRule) {
    ctx.addIssue({ code: 'custom', message: unmetRule.message });
    return;
  }

  if (isCommonPassword(value)) {
    ctx.addIssue({
      code: 'custom',
      message: 'That password is too common. Choose something harder to guess.',
    });
  }
});

/**
 * Rejects passwords that embed the account holder's own name or email handle —
 * the first thing an attacker tries against a known address.
 */
export function containsIdentityToken(password: string, tokens: string[]): boolean {
  const normalizedPassword = password.toLowerCase();

  return tokens.some((token) => {
    const normalizedToken = token.trim().toLowerCase();
    return normalizedToken.length >= 3 && normalizedPassword.includes(normalizedToken);
  });
}
