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

function cloneMongoUrl(source: URL, authSource?: string | null) {
  const cloned = new URL(source.toString());

  if (authSource && authSource.trim()) {
    cloned.searchParams.set("authSource", authSource.trim());
  } else {
    cloned.searchParams.delete("authSource");
  }

  return cloned.toString();
}

function buildMongoCandidates(rawUri: string) {
  const trimmedUri = stripWrappingQuotes(rawUri);
  const sourceUrl = new URL(trimmedUri);
  const explicitAuthSource = process.env.MONGODB_AUTH_SOURCE?.trim();
  const pathDb = sourceUrl.pathname.replace(/^\/+/, "").trim() || undefined;

  const seen = new Set<string>();
  const candidates: Array<{uri: string; authSource?: string}> = [];
  const push = (uri: string, authSource?: string) => {
    if (!seen.has(uri)) {
      seen.add(uri);
      candidates.push({uri, authSource});
    }
  };

  push(sourceUrl.toString(), sourceUrl.searchParams.get("authSource") ?? undefined);

  if (explicitAuthSource) {
    push(cloneMongoUrl(sourceUrl, explicitAuthSource), explicitAuthSource);
  } else {
    if (sourceUrl.searchParams.has("authSource")) {
      push(cloneMongoUrl(sourceUrl, null));
    }

    push(cloneMongoUrl(sourceUrl, "admin"), "admin");

    if (pathDb && pathDb !== "test") {
      push(cloneMongoUrl(sourceUrl, pathDb), pathDb);
    }
  }

  return {
    candidates,
    host: sourceUrl.host,
    pathDb,
  };
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

  const {candidates, host, pathDb} = buildMongoCandidates(rawMongoUri);
  const resolvedDbName = process.env.MONGODB_DB_NAME?.trim() || pathDb;

  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if not exists
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: resolvedDbName,
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

    cached.promise = (async () => {
      let lastError: unknown = null;

      for (const candidate of candidates) {
        const candidateAuthSource = candidate.authSource ?? "(default)";
        console.log(
          `DB_CONNECT_INFO: Trying MongoDB host=${host} db=${resolvedDbName ?? "(default)"} authSource=${candidateAuthSource}`
        );

        try {
          const mongooseInstance = await mongoose.connect(candidate.uri, opts);
          console.log(
            `DB_CONNECT_SUCCESS: MongoDB connection established using authSource=${candidateAuthSource}.`
          );
          return mongooseInstance;
        } catch (error) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);

          if (!/bad auth|authentication failed|auth failed/i.test(message)) {
            throw error;
          }

          console.warn(
            `DB_CONNECT_WARN: MongoDB auth failed with authSource=${candidateAuthSource}.`
          );
          await mongoose.disconnect().catch(() => undefined);
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to connect to MongoDB.");
    })();
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
