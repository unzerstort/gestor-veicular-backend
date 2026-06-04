import { config } from "dotenv";
import { z } from "zod";

config();

const databaseSslModeSchema = z.enum(["disable", "require", "no-verify"]);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  TEST_DATABASE_URL: z.string().min(1).optional(),
  DATABASE_SSL_MODE: databaseSslModeSchema.optional(),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().optional()
});

export type DatabaseSslMode = z.infer<typeof databaseSslModeSchema>;
export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}

export function getDatabaseSslMode(env: Env = getEnv()): DatabaseSslMode {
  if (env.DATABASE_SSL_MODE) {
    return env.DATABASE_SSL_MODE;
  }

  return env.NODE_ENV === "production" ? "require" : "disable";
}

export function resetEnvCache(): void {
  cachedEnv = null;
}
