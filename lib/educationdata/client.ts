export type PagedResponse<T> = {
  results: T[];
  next: string | null;
  count?: number;
};

export async function fetchAllPages<T>(
  url: string,
  init?: RequestInit
): Promise<T[]> {
  const out: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      ...init,
      headers: { accept: 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      throw new Error(`EducationData API error ${res.status} for ${nextUrl}`);
    }
    const data = (await res.json()) as PagedResponse<T>;
    out.push(...(data.results ?? []));
    nextUrl = data.next;
  }

  return out;
}

