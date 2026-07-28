import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

const mongoUri: string = MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache__: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache__ ?? {
  conn: null,
  promise: null,
};

global.__mongooseCache__ = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // A cached Mongoose instance can outlive a dropped development connection.
  // Clear it so the next request can establish a fresh pool.
  if (cache.conn && mongoose.connection.readyState === 0) {
    cache.conn = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME ?? 'billboard-hub',
      serverSelectionTimeoutMS: 8_000,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    // Never retain a rejected promise. DNS, Wi-Fi, and Atlas maintenance
    // failures are often transient; later requests must be allowed to retry.
    cache.conn = null;
    cache.promise = null;
    throw error;
  }
}
