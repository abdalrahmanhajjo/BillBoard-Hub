import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/shared/contracts/auth/login.schema';
import { authService } from '@/server/modules/auth/auth.service';
import { authCallbacks } from '@/server/modules/auth/callbacks';
import { authRepository } from '@/server/modules/auth/auth.repository';

export const authConfig: NextAuthConfig = {
  adapter: authRepository.adapter,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await authService.authenticateCredentials(
          parsed.data.email,
          parsed.data.password,
        );

        if (!user || !user.isActive) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: authCallbacks,
};
