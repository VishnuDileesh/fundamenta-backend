import { config } from "dotenv";
import { z } from "zod";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

const envSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.url("DATABASE_URL must be a valid URL"),
  APP_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.log("Invalid environment variables:", parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
