import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/mongoose';

export type HealthReport = {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  environment: string;
  commit?: string;
  region?: string;
  checkedAt: string;
  latencyMs: number;
};

/**
 * Liveness plus dependency check for uptime monitors and post-deploy smoke
 * tests. The database is pinged rather than merely connected to: a serverless
 * instance can hold a cached Mongoose object whose socket died while the
 * instance was frozen, which `readyState` alone still reports as connected.
 *
 * Never include connection strings, secrets, or user data here — the endpoint
 * is deliberately unauthenticated so a monitor can call it.
 */
export async function checkHealth(): Promise<HealthReport> {
  const startedAt = Date.now();
  let database: HealthReport['database'] = 'down';

  try {
    await connectToDatabase();
    await mongoose.connection.db?.admin().command({ ping: 1 });
    database = 'up';
  } catch {
    database = 'down';
  }

  return {
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    region: process.env.VERCEL_REGION,
    checkedAt: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
  };
}
