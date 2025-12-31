import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_123' })),
}));

const getSchoolsByLeaidMock = vi.fn();
vi.mock('@/lib/educationdata/directory', () => ({
  getSchoolsByLeaid: (leaid: string) => getSchoolsByLeaidMock(leaid),
}));

describe('GET /api/geo/schools', () => {
  it('returns 400 on invalid leaid', async () => {
    const { GET } = await import('./route');
    const res = await GET(new Request('http://localhost/api/geo/schools?leaid='));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid leaid');
  });

  it('returns schools for a valid leaid', async () => {
    getSchoolsByLeaidMock.mockResolvedValueOnce([
      { ncessch: 'x', schoolName: 'School', leaid: '0803450' },
    ]);
    const { GET } = await import('./route');
    const res = await GET(new Request('http://localhost/api/geo/schools?leaid=0803450'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.schools).toEqual([
      { ncessch: 'x', schoolName: 'School', leaid: '0803450' },
    ]);
    expect(getSchoolsByLeaidMock).toHaveBeenCalledWith('0803450');
  });
});

