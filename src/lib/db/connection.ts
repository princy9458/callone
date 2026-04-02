import mongoose from "mongoose";

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & {
  __mongoose__?: CachedMongoose;
};

const cached = globalCache.__mongoose__ ?? { conn: null, promise: null };

if (!globalCache.__mongoose__) {
  globalCache.__mongoose__ = cached;
}

export default async function dbConnect() {
  const NEXTAUTH_MONGODB_URI = process.env.NEXTAUTH_MONGODB_URI;

  if (!NEXTAUTH_MONGODB_URI) {
    console.error("DB_CONNECT_ERROR: NEXTAUTH_MONGODB_URI is not defined.");
    throw new Error("Missing NEXTAUTH_MONGODB_URI. Define it in .env.local before running CallawayOne.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("DB_CONNECT_INFO: Starting new connection to MongoDB...");
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(NEXTAUTH_MONGODB_URI, opts).then((mongoose) => {
      console.log("DB_CONNECT_SUCCESS: Established connection to MongoDB.");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    console.error("DB_CONNECT_ERROR: Failed to connect to MongoDB:", error.message || error);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
