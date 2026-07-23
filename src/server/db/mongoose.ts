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
  if (cache.conn) {
    return cache.conn;
  }

  console.log('Connecting to MongoDB...');
  console.log('MongoDB URI:', mongoUri);
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME ?? 'billboard-hub',
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
