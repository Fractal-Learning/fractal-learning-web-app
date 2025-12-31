import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/env', () => {
  return {
    getEnv: () => ({
      EDUCATIONDATA_BASE_URL: 'https://educationdata.example/api/v1',
      CCD_DIRECTORY_YEAR: 2023,
      CCD_DATA_ORIGIN: 'urban_educationdata_ccd_api',
      CCD_DATASET: 'ccd',
      CCD_CACHE_TTL_DAYS: 30,
      // required by schema but unused in these tests
      DATABASE_URL: 'https://example.com',
      CLERK_WEBHOOK_SECRET: 'x',
    }),
  };
});

const fetchAllPagesMock = vi.fn();
vi.mock('./client', async () => {
  return {
    fetchAllPages: (url: string) => fetchAllPagesMock(url),
  };
});

function makeDb({
  cachedDistricts = [],
  cachedSchools = [],
}: {
  cachedDistricts?: any[];
  cachedSchools?: any[];
}) {
  // district select chain
  const districtOrderBy = vi.fn(async () => cachedDistricts);
  const districtWhere = vi.fn(() => ({ orderBy: districtOrderBy }));
  const districtFrom = vi.fn(() => ({ where: districtWhere }));

  // school select chain
  const schoolOrderBy = vi.fn(async () => cachedSchools);
  const schoolWhere = vi.fn(() => ({ orderBy: schoolOrderBy }));
  const schoolFrom = vi.fn(() => ({ where: schoolWhere }));

  const select = vi.fn((fields: any) => {
    const hasLeaidField = Boolean(fields?.leaid);
    const hasNcesschField = Boolean(fields?.ncessch);
    if (hasNcesschField) return { from: schoolFrom };
    if (hasLeaidField) return { from: districtFrom };
    return { from: districtFrom };
  });

  const onConflictDoUpdate = vi.fn(async () => undefined);
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));

  return {
    select,
    insert,
    __calls: { districtFrom, districtWhere, districtOrderBy, schoolFrom, schoolWhere, schoolOrderBy, onConflictDoUpdate, values, insert },
  };
}

describe('educationdata directory caching', () => {
  beforeEach(() => {
    fetchAllPagesMock.mockReset();
    vi.resetModules();
  });

  it('returns cached districts without calling upstream', async () => {
    const db = makeDb({
      cachedDistricts: [
        { leaid: '1', leaName: 'A District', fetchedAt: new Date() },
        { leaid: '2', leaName: 'B District', fetchedAt: new Date() },
      ],
    });
    vi.doMock('@/lib/db', () => ({ getDb: () => db }));

    const { getDistrictsByFips } = await import('./directory');
    fetchAllPagesMock.mockResolvedValueOnce([
      { leaid: 'x', lea_name: 'X', fips: 8 },
    ]);

    const out = await getDistrictsByFips(8);
    expect(out).toEqual([
      { leaid: '1', leaName: 'A District' },
      { leaid: '2', leaName: 'B District' },
    ]);
    expect(fetchAllPagesMock).not.toHaveBeenCalled();
  });

  it('fetches and upserts districts on cache miss', async () => {
    const db = makeDb({ cachedDistricts: [] });
    vi.doMock('@/lib/db', () => ({ getDb: () => db }));

    const { getDistrictsByFips } = await import('./directory');
    fetchAllPagesMock.mockResolvedValueOnce([
      { leaid: '0800010', lea_name: 'Alpha', fips: 8 },
      { leaid: '0800020', lea_name: 'Beta', fips: 8 },
    ]);

    const out = await getDistrictsByFips(8);
    expect(out.map((d) => d.leaid)).toEqual(['0800010', '0800020']);
    expect(fetchAllPagesMock).toHaveBeenCalledTimes(1);
    expect(db.__calls.insert).toHaveBeenCalled();
    expect(db.__calls.onConflictDoUpdate).toHaveBeenCalledTimes(2);
  });
});

