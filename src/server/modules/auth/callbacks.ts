import type { NextAuthConfig } from "next-auth";
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  createOpaqueToken,
} from "@/server/modules/auth/tokens";
import type { UserRole } from "@/shared/types/user";
import { userService } from "../users/user.service";

export const authCallbacks: NextAuthConfig["callbacks"] = {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.isActive = user.isActive;
      token.firstName = user.firstName;
      token.lastName = user.lastName;
      token.refreshToken = token.refreshToken ?? createOpaqueToken();
      token.refreshTokenExpires = Date.now() + REFRESH_TOKEN_TTL_MS;
      token.accessToken = createOpaqueToken();
      token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
      token.error = undefined;
    }

    const hasRefreshToken = typeof token.refreshToken === "string";
    const refreshTokenExpired =
      typeof token.refreshTokenExpires === "number" &&
      Date.now() > token.refreshTokenExpires;

    if (hasRefreshToken && refreshTokenExpired) {
      token.error = "RefreshTokenExpired";
      token.accessToken = undefined;
      token.accessTokenExpires = undefined;
      return token;
    }

    const accessTokenExpired =
      typeof token.accessTokenExpires === "number" &&
      Date.now() > token.accessTokenExpires;

    if (accessTokenExpired || !token.accessToken) {
      if (!hasRefreshToken) {
        token.error = "RefreshTokenMissing";
        return token;
      }

      // Refresh access token while refresh token is still valid.
      token.accessToken = createOpaqueToken();
      token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
      token.error = undefined;
    }

    return token;
  },

  async session({ session, token }) {
    const tokenId = typeof token.id === "string" ? token.id : "";
    const tokenRole =
      token.role === "admin" || token.role === "advertiser"
        ? (token.role as UserRole)
        : undefined;
    const tokenIsActive = typeof token.isActive === "boolean" ? token.isActive : false;
    const tokenFirstName = typeof token.firstName === "string" ? token.firstName : '';
    const tokenLastName = typeof token.lastName === "string" ? token.lastName : '';

    if (session.user) {
      session.user.id = tokenId;
      session.user.role = tokenRole ?? "advertiser";
      session.user.isActive = tokenIsActive;
      session.user.firstName = tokenFirstName;
      session.user.lastName = tokenLastName;
    }

    session.accessToken =
      typeof token.accessToken === "string" ? token.accessToken : undefined;
    session.accessTokenExpires =
      typeof token.accessTokenExpires === "number" ? token.accessTokenExpires : undefined;
    session.error = typeof token.error === "string" ? token.error : undefined;

    return session;
  },

  async signIn({ user }) {
    if (!user?.email) {
      return false;
    }

    const dbUser = await userService.getById(user.id);
    return !!dbUser?.isActive;
  },
};
