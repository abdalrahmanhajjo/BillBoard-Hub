import { createHash, randomBytes } from 'node:crypto';
import { passwordResetRepository } from '@/server/modules/auth/password-reset.repository';
import { userRepository } from '@/server/modules/users/user.repository';
import { userService } from '@/server/modules/users/user.service';
import { mailer } from '@/server/mail/mailer';
import { buildPasswordResetEmail } from '@/server/mail/templates/password-reset-email';
import { absoluteAppUrl } from '@/shared/config/app-url';
import { BadRequestError } from '@/shared/http/http-error';
import type {
  ForgotPasswordSchemaOutput,
  ResetPasswordSchemaOutput,
} from '@/shared/contracts/auth/password-reset.schema';

const TOKEN_TTL_MS = Number(process.env.PASSWORD_RESET_TTL_MS) || 60 * 60 * 1000;
const MAX_REQUESTS_PER_HOUR = 5;

const EXPIRED_TOKEN_MESSAGE =
  'This reset link has expired or has already been used. Request a new one to continue.';

type RequestContext = {
  requestedFrom?: string;
};

export type PasswordResetRequestResult = {
  /**
   * The reset link, populated only when `mailer.allowsLinkPreview()` is true —
   * local development with no provider configured, where the link would
   * otherwise be trapped in the server log. It reveals that the address has an
   * account, so it is unreachable in production or once delivery works.
   */
  previewUrl?: string;
  /**
   * Why no link was issued, under the same development-only gate as
   * `previewUrl`. Without it a throttled or unknown address is indistinguishable
   * from a working request that simply could not be delivered.
   */
  previewNote?: string;
};

/** The raw token only ever exists in the email; the database holds its digest. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function resetUrlFor(token: string): string {
  return absoluteAppUrl(`/reset-password?token=${encodeURIComponent(token)}`);
}

/**
 * Explains a silent bail-out, but only where link previews are already allowed.
 * In every other environment the caller still gets nothing, preserving the
 * identical-response guarantee.
 */
function previewNote(note: string): PasswordResetRequestResult {
  return mailer.allowsLinkPreview() ? { previewNote: note } : {};
}

export const passwordResetService = {
  /**
   * Resolves the same way for every address. Reporting whether an email is
   * registered would turn this endpoint into an account-enumeration oracle, so
   * unknown, inactive, and rate-limited addresses all return quietly.
   */
  async request(
    input: ForgotPasswordSchemaOutput,
    context: RequestContext = {},
  ): Promise<PasswordResetRequestResult> {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      return previewNote('No account uses that email address.');
    }

    if (!user.isActive) {
      return previewNote('That account is deactivated, so no reset link was issued.');
    }

    const userId = String(user._id);
    const recentRequests = await passwordResetRepository.countCreatedSince(
      userId,
      new Date(Date.now() - 60 * 60 * 1000),
    );

    if (recentRequests >= MAX_REQUESTS_PER_HOUR) {
      return previewNote(
        `This account has already requested ${MAX_REQUESTS_PER_HOUR} reset links in the past hour. Wait before requesting another.`,
      );
    }

    // Only the newest link should work, so any earlier one is spent first.
    await passwordResetRepository.invalidateForUser(userId);

    const token = randomBytes(32).toString('base64url');
    await passwordResetRepository.create({
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      requestedFrom: context.requestedFrom,
    });

    const resetUrl = resetUrlFor(token);
    const message = buildPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
      expiresInMinutes: Math.round(TOKEN_TTL_MS / 60_000),
    });

    try {
      await mailer.send(message);
    } catch (error) {
      // Surfacing a delivery failure here would reveal that the address exists.
      // Log it for operators and still return the generic response.
      console.error('[password-reset] delivery failed', error);
    }

    return mailer.allowsLinkPreview() ? { previewUrl: resetUrl } : {};
  },

  /** Lets the reset page tell a dead link from a live one before asking for input. */
  async isTokenUsable(token: string): Promise<boolean> {
    const record = await passwordResetRepository.findActiveByTokenHash(hashToken(token));
    return record !== null;
  },

  async reset(input: ResetPasswordSchemaOutput): Promise<void> {
    const record = await passwordResetRepository.findActiveByTokenHash(hashToken(input.token));

    if (!record) {
      throw new BadRequestError(EXPIRED_TOKEN_MESSAGE);
    }

    await userService.replacePassword(record.userId, input.password);

    // Consumes the token that was just used along with any other outstanding
    // ones, so a leaked older link cannot be replayed.
    await passwordResetRepository.invalidateForUser(record.userId);
  },
};
