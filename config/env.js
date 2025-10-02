import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.string("DIRECT_URL must be a valid URL"),
  JWT_SECRET: z.string("JWT_SECRET must be a valid string"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string("JWT_REFRESH_SECRET must be a valid string"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.log("Invalid environment variables:", parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
