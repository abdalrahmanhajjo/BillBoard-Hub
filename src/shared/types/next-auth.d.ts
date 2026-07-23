import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@/shared/types/user';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user: import('@/shared/types/user').User & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    refreshTokenExpires?: number;
    error?: string;
  }
}
