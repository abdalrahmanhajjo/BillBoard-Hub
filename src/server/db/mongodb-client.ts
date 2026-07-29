import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

declare global {
  var __mongoClient__: MongoClient | undefined;
}

const client =
  global.__mongoClient__ ??
  new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 8_000,
  });

// Auth.js explicitly recommends a non-connected MongoClient. Passing an eager
// connection promise can create an unhandled rejection during module loading
// when DNS or Atlas is temporarily unavailable.
export const mongoClient = client;

if (process.env.NODE_ENV !== 'production') {
  global.__mongoClient__ = client;
}
