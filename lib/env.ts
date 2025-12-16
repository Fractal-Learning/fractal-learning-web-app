import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1).optional(), // Optional for client-side or if not needed everywhere, but seems needed for onboarding
  HOME_PAGE_PASSWORD: z.string().min(1).optional(), // Optional password protection for home page
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    HOME_PAGE_PASSWORD: process.env.HOME_PAGE_PASSWORD,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}
