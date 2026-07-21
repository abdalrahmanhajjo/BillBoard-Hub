import { NextResponse, type NextRequest } from "next/server";
import {
  authProtectedPrefixes,
  guestOnlyRoutes,
} from "@/server/middleware";

function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";

  return [
    "authjs.session-token=",
    "__Secure-authjs.session-token=",
    "next-auth.session-token=",
    "__Secure-next-auth.session-token=",
  ].some((token) => cookieHeader.includes(token));
}

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoggedIn = hasSessionCookie(request);
  const pathname = nextUrl.pathname;

  const isGuestOnly = guestOnlyRoutes.some((route) => pathname.startsWith(route));
  const isDashboardRoot = pathname === "/dashboard";
  const isProtectedByAuth = authProtectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isGuestOnly && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if ((isProtectedByAuth || isDashboardRoot) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
  ],
};
