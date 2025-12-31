import crypto from 'node:crypto';
import { and, asc, eq, gt } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getEnv } from '@/lib/env';
import { ncesDistrictCache, ncesSchoolCache } from '@/db/schema';
import { fetchAllPages } from './client';

function ttlCutoff(ttlDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - ttlDays);
  return d;
}

function stableStringify(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(',')}}`;
}

function hashRow(row: unknown): string {
  return crypto.createHash('sha256').update(stableStringify(row)).digest('hex');
}

export type DistrictOption = { leaid: string; leaName: string };
export type SchoolOption = { ncessch: string; schoolName: string; leaid: string };

type UrbanDistrictRow = {
  leaid: string;
  lea_name: string;
  fips: number;
  [k: string]: unknown;
};

type UrbanSchoolRow = {
  ncessch: string;
  school_name: string;
  leaid: string;
  [k: string]: unknown;
};

export async function getDistrictsByFips(fips: number): Promise<DistrictOption[]> {
  const env = getEnv();
  const db = getDb();

  const cached = await db
    .select({
      leaid: ncesDistrictCache.leaid,
      leaName: ncesDistrictCache.leaName,
      fetchedAt: ncesDistrictCache.fetchedAt,
    })
    .from(ncesDistrictCache)
    .where(
      and(
        eq(ncesDistrictCache.fips, fips),
        eq(ncesDistrictCache.datasetYear, env.CCD_DIRECTORY_YEAR),
        eq(ncesDistrictCache.dataOrigin, env.CCD_DATA_ORIGIN),
        eq(ncesDistrictCache.dataset, env.CCD_DATASET),
        gt(ncesDistrictCache.fetchedAt, ttlCutoff(env.CCD_CACHE_TTL_DAYS))
      )
    )
    .orderBy(asc(ncesDistrictCache.leaName));

  if (cached.length) {
    return cached.map((r) => ({ leaid: r.leaid, leaName: r.leaName }));
  }

  const url = `${env.EDUCATIONDATA_BASE_URL}/school-districts/${env.CCD_DATASET}/directory/${env.CCD_DIRECTORY_YEAR}/?fips=${fips}`;
  const rows = await fetchAllPages<UrbanDistrictRow>(url);

  for (const row of rows) {
    const rowHash = hashRow(row);
    await db
      .insert(ncesDistrictCache)
      .values({
        leaid: row.leaid,
        leaName: row.lea_name,
        fips: row.fips ?? fips,
        dataOrigin: env.CCD_DATA_ORIGIN,
        dataset: env.CCD_DATASET,
        datasetYear: env.CCD_DIRECTORY_YEAR,
        sourceRowHash: rowHash,
        raw: row as any,
      })
      .onConflictDoUpdate({
        target: ncesDistrictCache.leaid,
        set: {
          leaName: row.lea_name,
          fips: row.fips ?? fips,
          dataOrigin: env.CCD_DATA_ORIGIN,
          dataset: env.CCD_DATASET,
          datasetYear: env.CCD_DIRECTORY_YEAR,
          sourceRowHash: rowHash,
          raw: row as any,
          fetchedAt: new Date(),
        },
      });
  }

  return rows
    .map((r) => ({ leaid: r.leaid, leaName: r.lea_name }))
    .sort((a, b) => a.leaName.localeCompare(b.leaName));
}

export async function getSchoolsByLeaid(leaid: string): Promise<SchoolOption[]> {
  const env = getEnv();
  const db = getDb();

  const cached = await db
    .select({
      ncessch: ncesSchoolCache.ncessch,
      schoolName: ncesSchoolCache.schoolName,
      leaid: ncesSchoolCache.leaid,
      fetchedAt: ncesSchoolCache.fetchedAt,
    })
    .from(ncesSchoolCache)
    .where(
      and(
        eq(ncesSchoolCache.leaid, leaid),
        eq(ncesSchoolCache.datasetYear, env.CCD_DIRECTORY_YEAR),
        eq(ncesSchoolCache.dataOrigin, env.CCD_DATA_ORIGIN),
        eq(ncesSchoolCache.dataset, env.CCD_DATASET),
        gt(ncesSchoolCache.fetchedAt, ttlCutoff(env.CCD_CACHE_TTL_DAYS))
      )
    )
    .orderBy(asc(ncesSchoolCache.schoolName));

  if (cached.length) {
    return cached.map((r) => ({
      ncessch: r.ncessch,
      schoolName: r.schoolName,
      leaid: r.leaid,
    }));
  }

  const url = `${env.EDUCATIONDATA_BASE_URL}/schools/${env.CCD_DATASET}/directory/${env.CCD_DIRECTORY_YEAR}/?leaid=${encodeURIComponent(leaid)}`;
  const rows = await fetchAllPages<UrbanSchoolRow>(url);

  for (const row of rows) {
    const rowHash = hashRow(row);
    await db
      .insert(ncesSchoolCache)
      .values({
        ncessch: row.ncessch,
        schoolName: row.school_name,
        leaid: row.leaid,
        dataOrigin: env.CCD_DATA_ORIGIN,
        dataset: env.CCD_DATASET,
        datasetYear: env.CCD_DIRECTORY_YEAR,
        sourceRowHash: rowHash,
        raw: row as any,
      })
      .onConflictDoUpdate({
        target: ncesSchoolCache.ncessch,
        set: {
          schoolName: row.school_name,
          leaid: row.leaid,
          dataOrigin: env.CCD_DATA_ORIGIN,
          dataset: env.CCD_DATASET,
          datasetYear: env.CCD_DIRECTORY_YEAR,
          sourceRowHash: rowHash,
          raw: row as any,
          fetchedAt: new Date(),
        },
      });
  }

  return rows
    .map((r) => ({ ncessch: r.ncessch, schoolName: r.school_name, leaid: r.leaid }))
    .sort((a, b) => a.schoolName.localeCompare(b.schoolName));
}

