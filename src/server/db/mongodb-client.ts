import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

declare global {
  var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

const client = new MongoClient(MONGODB_URI);

export const mongoClientPromise =
  global.__mongoClientPromise__ ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  global.__mongoClientPromise__ = mongoClientPromise;
}
