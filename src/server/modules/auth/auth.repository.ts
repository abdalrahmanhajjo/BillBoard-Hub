import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { mongoClient } from '@/server/db/mongodb-client';

/**
 * Module-local persistence boundary for Auth.js.
 *
 * Keeping adapter construction here prevents auth configuration from reaching
 * directly into the database layer.
 */
export const authRepository = {
  adapter: MongoDBAdapter(mongoClient, {
    databaseName: process.env.MONGODB_DB_NAME ?? 'billboard_hub',
  }),
};
