import mongoose from "mongoose";

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & {
  __mongoose__?: CachedMongoose;
};

const cached = globalCache.__mongoose__ ?? {conn: null, promise: null};

if (!globalCache.__mongoose__) {
  globalCache.__mongoose__ = cached;
}

export default async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
   console.log("MONGODB_URI",MONGODB_URI)
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI. Define it in .env.local before running CallawayOne.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {bufferCommands: false});
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
