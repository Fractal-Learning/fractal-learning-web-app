import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_123' })),
}));

const getDistrictsByFipsMock = vi.fn();
vi.mock('@/lib/educationdata/directory', () => ({
  getDistrictsByFips: (fips: number) => getDistrictsByFipsMock(fips),
}));

describe('GET /api/geo/districts', () => {
  it('returns 400 on invalid state', async () => {
    const { GET } = await import('./route');
    const res = await GET(new Request('http://localhost/api/geo/districts?state=XXX'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid state');
  });

  it('returns districts for a valid state', async () => {
    getDistrictsByFipsMock.mockResolvedValueOnce([{ leaid: '1', leaName: 'A' }]);
    const { GET } = await import('./route');
    const res = await GET(new Request('http://localhost/api/geo/districts?state=CO'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.districts).toEqual([{ leaid: '1', leaName: 'A' }]);
    expect(getDistrictsByFipsMock).toHaveBeenCalledWith(8);
  });
});

