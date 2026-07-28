import { signIn, signOut } from '@/auth';
import { authService } from '@/server/modules/auth/auth.service';
import { apiResponse } from '@/server/http/api-response';
import {
  handleControllerError,
  requireSession,
  validationMessage,
} from '@/server/http/controller-utils';
import type { LoginSchemaInput } from '@/shared/contracts/auth/login.schema';
import { loginSchema } from '@/shared/contracts/auth/login.schema';
import type { RegisterSchemaInput } from '@/shared/contracts/auth/register.schema';
import { registerSchema } from '@/shared/contracts/auth/register.schema';
import type {
  ForgotPasswordSchemaInput,
  ResetPasswordSchemaInput,
} from '@/shared/contracts/auth/password-reset.schema';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  resetTokenSchema,
} from '@/shared/contracts/auth/password-reset.schema';
import { passwordResetService } from '@/server/modules/auth/password-reset.service';

/**
 * Identical for registered and unregistered addresses — the endpoint must not
 * reveal which emails have accounts.
 */
const RESET_REQUESTED_MESSAGE =
  'If that email address has an account, a reset link is on its way. Check your inbox and spam folder.';

export const authController = {
  async login(payload: LoginSchemaInput) {
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid login payload.'),
      );
    }

    try {
      await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      return apiResponse.success(200);
    } catch (error) {
      return handleControllerError(error, 'Unable to sign in right now. Please try again.');
    }
  },

  async logout() {
    try {
      await signOut({ redirect: false });
      return apiResponse.success(200);
    } catch (error) {
      return handleControllerError(error, 'Unable to sign out right now. Please try again.');
    }
  },

  async me() {
    try {
      const session = await requireSession();
      const user = await authService.getCurrentUser(session.user.id, session.user);

      return apiResponse.ok({
        user,
        accessToken: session.accessToken,
        accessTokenExpires: session.accessTokenExpires,
        sessionError: session.error,
      });
    } catch (error) {
      return handleControllerError(error, 'Unable to fetch session user right now.');
    }
  },

  async refresh() {
    try {
      const session = await requireSession();

      if (session.error === 'RefreshTokenExpired' || session.error === 'RefreshTokenMissing') {
        return apiResponse.unauthorized(session.error);
      }

      return apiResponse.ok({
        accessToken: session.accessToken,
        accessTokenExpires: session.accessTokenExpires,
      });
    } catch (error) {
      return handleControllerError(error, 'Unable to refresh session right now.');
    }
  },

  async register(payload: RegisterSchemaInput) {
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Invalid registration payload.'),
      );
    }

    try {
      const user = await authService.register(parsed.data);

      return apiResponse.ok(user, 201);
    } catch (error) {
      return handleControllerError(error, 'Registration failed.');
    }
  },

  async forgotPassword(payload: ForgotPasswordSchemaInput, requestedFrom?: string) {
    const parsed = forgotPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Enter the email address on your account.'),
      );
    }

    try {
      const { previewUrl, previewNote } = await passwordResetService.request(parsed.data, {
        requestedFrom,
      });

      // Both preview fields are populated only for local development without a
      // mail provider; see PasswordResetRequestResult.
      return apiResponse.ok({
        message: RESET_REQUESTED_MESSAGE,
        ...(previewUrl ? { previewUrl } : {}),
        ...(previewNote ? { previewNote } : {}),
      });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not start the password reset right now. Try again.',
      );
    }
  },

  async verifyResetToken(token: string | null) {
    const parsed = resetTokenSchema.safeParse(token ?? '');

    // A malformed token is simply an unusable one — there is nothing to report
    // beyond that, so the shape check and the lookup share a response.
    if (!parsed.success) {
      return apiResponse.ok({ valid: false });
    }

    try {
      return apiResponse.ok({ valid: await passwordResetService.isTokenUsable(parsed.data) });
    } catch (error) {
      return handleControllerError(error, 'We could not check that reset link. Try again.');
    }
  },

  async resetPassword(payload: ResetPasswordSchemaInput) {
    const parsed = resetPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, 'Check the new password and try again.'),
      );
    }

    try {
      await passwordResetService.reset(parsed.data);

      return apiResponse.ok({
        message: 'Your password has been updated. Sign in with your new password.',
      });
    } catch (error) {
      return handleControllerError(
        error,
        'We could not update your password right now. Try again.',
      );
    }
  },
};
