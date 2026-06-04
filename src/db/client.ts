import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import { getDatabaseSslMode, getEnv, type DatabaseSslMode, type Env } from "../config/env.js";

export type DbClient = ReturnType<typeof drizzle>;

type CreatePoolOptions = {
  connectionString?: string;
  max?: number;
  nodeEnv?: Env["NODE_ENV"];
  sslMode?: DatabaseSslMode;
};

let dbInstance: DbClient | null = null;
let poolInstance: Pool | null = null;

export function createPoolConfig(options: CreatePoolOptions = {}): PoolConfig {
  const env = needsEnv(options) ? getEnv() : null;
  const nodeEnv = options.nodeEnv ?? env?.NODE_ENV ?? "development";
  const sslMode = options.sslMode ?? (env ? getDatabaseSslMode(env) : defaultSslModeForNodeEnv(nodeEnv));
  const connectionString = options.connectionString ?? env?.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a PostgreSQL pool.");
  }

  return {
    connectionString,
    max: options.max ?? env?.DATABASE_POOL_MAX ?? (nodeEnv === "production" ? 1 : 10),
    ssl: resolveSslConfig(sslMode)
  };
}

export function createPool(options: CreatePoolOptions = {}): Pool {
  return new Pool(createPoolConfig(options));
}

export function createDb(pool: Pool): DbClient {
  return drizzle(pool);
}

export function getPool(): Pool {
  poolInstance ??= createPool();
  return poolInstance;
}

export function getDb(): DbClient {
  dbInstance ??= createDb(getPool());
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  const pool = poolInstance;
  poolInstance = null;
  dbInstance = null;

  if (pool) {
    await pool.end();
  }
}

function needsEnv(options: CreatePoolOptions): boolean {
  return !options.connectionString || !options.nodeEnv || !options.sslMode || options.max === undefined;
}

function defaultSslModeForNodeEnv(nodeEnv: Env["NODE_ENV"]): DatabaseSslMode {
  return nodeEnv === "production" ? "require" : "disable";
}

function resolveSslConfig(sslMode: DatabaseSslMode): PoolConfig["ssl"] {
  switch (sslMode) {
    case "disable":
      return undefined;
    case "require":
      return { rejectUnauthorized: true };
    case "no-verify":
      return { rejectUnauthorized: false };
  }
}
