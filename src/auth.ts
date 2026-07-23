import NextAuth from 'next-auth';
import { authConfig } from '@/server/modules/auth/config';

export const { auth, signIn, signOut } = NextAuth(authConfig);
