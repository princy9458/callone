import mongoose from "mongoose";

type CachedMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend globalThis safely
declare global {
  // eslint-disable-next-line no-var
  var __mongoose__: CachedMongoose | undefined;
}

const globalCache = globalThis as typeof globalThis & {
  __mongoose__?: CachedMongoose;
};

const cached: CachedMongoose = globalCache.__mongoose__ || {
  conn: null,
  promise: null,
};

if (!globalCache.__mongoose__) {
  globalCache.__mongoose__ = cached;
}

// ---------- Helpers ----------

function parseTimeout(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return trimmed;

  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];

  if (
    (first === `"` && last === `"`) ||
    (first === `'` && last === `'`)
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizeMongoUri(rawUri: string) {
  const trimmedUri = stripWrappingQuotes(rawUri);

  try {
    const mongoUrl = new URL(trimmedUri);

    // Ensure authSource
    if (!mongoUrl.searchParams.has("authSource")) {
      const explicitAuthSource = process.env.MONGODB_AUTH_SOURCE?.trim();

      if (explicitAuthSource) {
        mongoUrl.searchParams.set("authSource", explicitAuthSource);
      } else if (
        mongoUrl.protocol === "mongodb+srv:" &&
        mongoUrl.hostname.endsWith(".mongodb.net")
      ) {
        mongoUrl.searchParams.set("authSource", "admin");
      }
    }

    return mongoUrl.toString();
  } catch (error) {
    throw new Error(
      `Invalid MongoDB connection string: ${
        error instanceof Error ? error.message : "Unable to parse URI"
      }`
    );
  }
}

// ---------- Main DB Connect ----------

export default async function dbConnect() {
  const rawMongoUri =
    process.env.MONGODB_URI ?? process.env.NEXTAUTH_MONGODB_URI;

  if (!rawMongoUri) {
    console.error("DB_CONNECT_ERROR: MongoDB URI is not defined.");
    throw new Error(
      "Missing MONGODB_URI or NEXTAUTH_MONGODB_URI. Add one of them to your deployment environment."
    );
  }

  const uri = normalizeMongoUri(rawMongoUri);

  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if not exists
  if (!cached.promise) {
    console.log("DB_CONNECT_INFO: Connecting to MongoDB...");

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB_NAME, // optional but recommended
      connectTimeoutMS: parseTimeout(
        process.env.MONGODB_CONNECT_TIMEOUT_MS,
        10000
      ),
      serverSelectionTimeoutMS: parseTimeout(
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
        10000
      ),
    };

    // Enable debug in development
    if (process.env.NODE_ENV === "development") {
      mongoose.set("debug", true);
    }

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log(
          "DB_CONNECT_SUCCESS: MongoDB connection established."
        );
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: any) {
    console.error(
      "DB_CONNECT_ERROR:",
      error?.message || error
    );
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
