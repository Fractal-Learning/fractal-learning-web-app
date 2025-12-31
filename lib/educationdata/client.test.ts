import { describe, expect, it, vi } from 'vitest';
import { fetchAllPages } from './client';

describe('fetchAllPages', () => {
  it('follows next links until null and concatenates results', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === 'https://example.com/page1') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [{ id: 1 }],
            next: 'https://example.com/page2',
          }),
        } as any;
      }
      if (url === 'https://example.com/page2') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [{ id: 2 }, { id: 3 }],
            next: null,
          }),
        } as any;
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock as any);
    const out = await fetchAllPages<{ id: number }>('https://example.com/page1');

    expect(out).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws on non-ok response', async () => {
    const fetchMock = vi.fn(async () => {
      return { ok: false, status: 500 } as any;
    });
    vi.stubGlobal('fetch', fetchMock as any);

    await expect(fetchAllPages('https://example.com/page1')).rejects.toThrow(
      /EducationData API error 500/
    );
  });
});

