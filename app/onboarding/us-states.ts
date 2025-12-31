import type { UsState } from '@/types/us-states';

export function filterUsStates(states: UsState[], query: string): UsState[] {
  const q = query.trim().toLowerCase();
  if (!q) return states;

  return states.filter((s) => {
    const haystack = `${s.name} ${s.code}`.toLowerCase();
    return haystack.includes(q);
  });
}

