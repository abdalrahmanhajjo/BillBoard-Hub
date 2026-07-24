import { NextResponse, type NextRequest } from 'next/server';
import { authProtectedPrefixes } from '@/server/middleware';

function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';

  return [
    'authjs.session-token=',
    '__Secure-authjs.session-token=',
    'next-auth.session-token=',
    '__Secure-next-auth.session-token=',
  ].some((token) => cookieHeader.includes(token));
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const isLoggedIn = hasSessionCookie(request);
  const pathname = nextUrl.pathname;

  const isDashboardRoot = pathname === '/dashboard';
  const isProtectedByAuth = authProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if ((isProtectedByAuth || isDashboardRoot) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
