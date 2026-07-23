import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { mongoClientPromise } from '@/server/db/mongodb-client';
import { loginSchema } from '@/shared/contracts/auth/login.schema';
import { authService } from '@/server/modules/auth/auth.service';
import { authCallbacks } from '@/server/modules/auth/callbacks';

export const authConfig: NextAuthConfig = {
  adapter: MongoDBAdapter(mongoClientPromise, {
    databaseName: process.env.MONGODB_DB_NAME ?? 'billboard_hub',
  }),
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
