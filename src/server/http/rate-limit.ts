import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/mongoose';

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

const COLLECTION = 'rate_limits';

type RateLimitDoc = {
  _id: string;
  count: number;
  resetAt: Date;
};

let indexReady: Promise<void> | null = null;

/**
 * Mongo sweeps spent windows so the collection cannot grow without bound. TTL
 * eviction is periodic, so every read still compares `resetAt` itself.
 */
async function ensureIndex(): Promise<void> {
  indexReady ??= (async () => {
    await connectToDatabase();
    await mongoose.connection
      .collection(COLLECTION)
      .createIndex({ resetAt: 1 }, { expireAfterSeconds: 60 });
  })().catch((error: unknown) => {
    // Let the next call retry rather than caching a rejected promise.
    indexReady = null;
    throw error;
  });

  return indexReady;
}

/**
 * Fixed-window rate limiter backed by MongoDB.
 *
 * Counters live in the database rather than in process memory, so a limit of
 * "5 per 15 minutes" holds across every server instance and survives restarts.
 * The previous in-memory Map reset on redeploy and granted each instance its
 * own full quota, which made the limit close to meaningless once more than one
 * instance was running.
 *
 * The window is advanced with a conditional update and the counter with an
 * atomic `$inc`, so two concurrent requests cannot both believe they opened the
 * window.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  await ensureIndex();

  const collection = mongoose.connection.collection<RateLimitDoc>(COLLECTION);
  const now = new Date();

  // Start a fresh window only when the previous one has lapsed. Matching on
  // `resetAt` makes this a single atomic step.
  const opened = await collection.findOneAndUpdate(
    { _id: key, resetAt: { $lte: now } },
    { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
    { returnDocument: 'after' },
  );

  if (opened) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  try {
    const current = await collection.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: { resetAt: new Date(now.getTime() + windowMs) },
      },
      { upsert: true, returnDocument: 'after' },
    );

    if (!current) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (current.count > maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000),
      );

      // Blocked attempts must not inflate the counter further, otherwise a
      // sustained burst would keep pushing the value up for no benefit.
      await collection.updateOne({ _id: key }, { $set: { count: maxRequests + 1 } });

      return { allowed: false, retryAfterSeconds };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    // Two racing upserts can collide on the primary key; the loser retries the
    // increment against the now-existing document.
    if ((error as { code?: number }).code === 11000) {
      const retried = await collection.findOneAndUpdate(
        { _id: key },
        { $inc: { count: 1 } },
        { returnDocument: 'after' },
      );

      if (retried && retried.count > maxRequests) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((retried.resetAt.getTime() - now.getTime()) / 1000),
          ),
        };
      }

      return { allowed: true, retryAfterSeconds: 0 };
    }

    throw error;
  }
}

/**
 * Best-effort client identity for rate-limit keys.
 *
 * Only the left-most `x-forwarded-for` entry is used, and it is length-capped:
 * the header is client-controlled, so an attacker could otherwise rotate it to
 * mint unlimited buckets or write oversized keys. Deployments must ensure the
 * proxy overwrites rather than appends this header.
 */
export function requestClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const candidate = forwardedFor || realIp || 'unknown';

  return candidate.slice(0, 64);
}
