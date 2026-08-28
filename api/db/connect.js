require('dotenv').config();
const { isEnabled } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');

const mongoose = require('mongoose');

function sanitizeMongoUri(uri) {
  if (!uri) {
    return uri;
  }
  let cleaned = String(uri).trim().replace(/^["']|["']$/g, '');
  while (/^MONGO_URI=/i.test(cleaned)) {
    cleaned = cleaned.replace(/^MONGO_URI=/i, '').trim();
  }
  if (!cleaned.includes('@') || /[?&]authSource=/i.test(cleaned)) {
    return cleaned;
  }
  return cleaned.includes('?') ? `${cleaned}&authSource=admin` : `${cleaned}?authSource=admin`;
}

function redactMongoUri(uri) {
  return String(uri || '').replace(/:([^@/]+)@/, ':***@');
}

function stripCredentials(uri) {
  return String(uri)
    .replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://')
    .replace(/[?&]authSource=[^&]*/gi, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '');
}

function isOnZeabur() {
  return Boolean(
    process.env.ZEABUR_WEB_URL || process.env.ZEABUR_PROJECT_ID || process.env.ZEABUR_SERVICE_ID,
  );
}

function composeFromMongoCreds() {
  const user = process.env.MONGO_USERNAME || process.env.MONGO_INITDB_ROOT_USERNAME;
  const pass = process.env.MONGO_PASSWORD || process.env.MONGO_INITDB_ROOT_PASSWORD;
  if (!user || !pass) {
    return null;
  }
  const host = process.env.MONGO_HOST || (isOnZeabur() ? 'mongodb.zeabur.internal' : '127.0.0.1');
  const port = process.env.MONGO_PORT || '27017';
  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/LibreChat?authSource=admin`;
}

function collectMongoUris() {
  const uris = [];
  const composed = composeFromMongoCreds();
  const fromEnv = sanitizeMongoUri(process.env.MONGO_URI);
  // Prefer live Zeabur username/password over a stale pasted MONGO_URI.
  if (composed) {
    uris.push(composed);
  }
  if (fromEnv && fromEnv !== composed && !/\$\{/.test(fromEnv)) {
    uris.push(fromEnv);
  }
  for (const uri of [...uris]) {
    if (uri.includes('@')) {
      uris.push(stripCredentials(uri));
    }
  }
  return [...new Set(uris.filter(Boolean))];
}

/** The maximum number of connections in the connection pool. */
const maxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE) || undefined;
/** The minimum number of connections in the connection pool. */
const minPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE) || undefined;
/** The maximum number of connections that may be in the process of being established concurrently by the connection pool. */
const maxConnecting = parseInt(process.env.MONGO_MAX_CONNECTING) || undefined;
/** The maximum number of milliseconds that a connection can remain idle in the pool before being removed and closed. */
const maxIdleTimeMS = parseInt(process.env.MONGO_MAX_IDLE_TIME_MS) || undefined;
/** The maximum time in milliseconds that a thread can wait for a connection to become available. */
const waitQueueTimeoutMS = parseInt(process.env.MONGO_WAIT_QUEUE_TIMEOUT_MS) || undefined;
/** Set to false to disable automatic index creation for all models associated with this connection. */
const autoIndex =
  process.env.MONGO_AUTO_INDEX != undefined
    ? isEnabled(process.env.MONGO_AUTO_INDEX) || false
    : undefined;

/** Set to `false` to disable Mongoose automatically calling `createCollection()` on every model created on this connection. */
const autoCreate =
  process.env.MONGO_AUTO_CREATE != undefined
    ? isEnabled(process.env.MONGO_AUTO_CREATE) || false
    : undefined;
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function mongoConnectOptions() {
  return {
    bufferCommands: false,
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 15000,
    ...(maxPoolSize ? { maxPoolSize } : {}),
    ...(minPoolSize ? { minPoolSize } : {}),
    ...(maxConnecting ? { maxConnecting } : {}),
    ...(maxIdleTimeMS ? { maxIdleTimeMS } : {}),
    ...(waitQueueTimeoutMS ? { waitQueueTimeoutMS } : {}),
    ...(autoIndex != undefined ? { autoIndex } : {}),
    ...(autoCreate != undefined ? { autoCreate } : {}),
  };
}

async function connectOnce(uri, opts) {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {
    // ignore leftover state between URI attempts
  }
  return mongoose.connect(uri, opts);
}

async function connectDb() {
  if (cached.conn && cached.conn?._readyState === 1) {
    return cached.conn;
  }

  const uris = collectMongoUris();
  if (uris.length === 0) {
    throw new Error(
      'Please define MONGO_URI, or set MONGO_USERNAME and MONGO_PASSWORD (Zeabur Mongo expose)',
    );
  }

  const disconnected = cached.conn && cached.conn?._readyState !== 1;
  if (!cached.promise || disconnected) {
    const opts = mongoConnectOptions();
    mongoose.set('strictQuery', true);
    logger.info('Mongo Connection options');
    logger.info(JSON.stringify(opts, null, 2));

    cached.promise = (async () => {
      let lastError;
      for (const uri of uris) {
        logger.info(`Mongo connecting ${redactMongoUri(uri)}`);
        try {
          return await connectOnce(uri, opts);
        } catch (err) {
          lastError = err;
          logger.error(`Mongo connect failed (${redactMongoUri(uri)}): ${err.message}`);
        }
      }
      throw lastError;
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
}

module.exports = {
  connectDb,
};
