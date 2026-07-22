import { signIn, signOut } from "@/auth";
import { authService } from "@/server/modules/auth/auth.service";
import { apiResponse } from "@/server/http/api-response";
import {
  handleControllerError,
  requireSession,
  validationMessage,
} from "@/server/http/controller-utils";
import type { LoginSchemaInput } from "@/shared/contracts/auth/login.schema";
import { loginSchema } from "@/shared/contracts/auth/login.schema";
import type { RegisterSchemaInput } from "@/shared/contracts/auth/register.schema";
import { registerSchema } from "@/shared/contracts/auth/register.schema";

export const authController = {
  async login(payload: LoginSchemaInput) {
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, "Invalid login payload."),
      );
    }

    try {
      await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      return apiResponse.success(200);
    } catch (error) {
      return handleControllerError(error, "Unable to sign in right now. Please try again.");
    }
  },

  async logout() {
    try {
      await signOut({ redirect: false });
      return apiResponse.success(200);
    } catch (error) {
      return handleControllerError(error, "Unable to sign out right now. Please try again.");
    }
  },

  async me() {
    try {
      const session = await requireSession();
      const user = await authService.getCurrentUser(session.user.id, session.user);

      return apiResponse.ok(
        {
          user,
          accessToken: session.accessToken,
          accessTokenExpires: session.accessTokenExpires,
          sessionError: session.error,
        }
      );
    } catch (error) {
      return handleControllerError(error, "Unable to fetch session user right now.");
    }
  },

  async refresh() {
    try {
      const session = await requireSession();

      if (
        session.error === "RefreshTokenExpired" ||
        session.error === "RefreshTokenMissing"
      ) {
        return apiResponse.unauthorized(session.error);
      }

      return apiResponse.ok(
        {
          accessToken: session.accessToken,
          accessTokenExpires: session.accessTokenExpires,
        }
      );
    } catch (error) {
      return handleControllerError(error, "Unable to refresh session right now.");
    }
  },

  async register(payload: RegisterSchemaInput) {
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, "Invalid registration payload."),
      );
    }

    try {
      const user = await authService.register(parsed.data);

      return apiResponse.ok(user, 201);
    } catch (error) {
      return handleControllerError(error, "Registration failed.");
    }
  },
};
