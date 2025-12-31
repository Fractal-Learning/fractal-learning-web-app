import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1).optional(), // Optional for client-side or if not needed everywhere, but seems needed for onboarding
  HOME_PAGE_PASSWORD: z.string().min(1).optional(), // Optional password protection for home page

  // Urban Institute Education Data API (CCD directory)
  EDUCATIONDATA_BASE_URL: z
    .string()
    .url()
    .default('https://educationdata.urban.org/api/v1'),
  CCD_DIRECTORY_YEAR: z.coerce.number().int().default(2023),
  CCD_DATA_ORIGIN: z.string().min(1).default('urban_educationdata_ccd_api'),
  CCD_DATASET: z.string().min(1).default('ccd'),
  CCD_CACHE_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    HOME_PAGE_PASSWORD: process.env.HOME_PAGE_PASSWORD,

    EDUCATIONDATA_BASE_URL: process.env.EDUCATIONDATA_BASE_URL,
    CCD_DIRECTORY_YEAR: process.env.CCD_DIRECTORY_YEAR,
    CCD_DATA_ORIGIN: process.env.CCD_DATA_ORIGIN,
    CCD_DATASET: process.env.CCD_DATASET,
    CCD_CACHE_TTL_DAYS: process.env.CCD_CACHE_TTL_DAYS,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}
