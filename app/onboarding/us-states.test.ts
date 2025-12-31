import { describe, expect, it } from 'vitest';
import { filterUsStates } from './us-states';
import type { UsState } from '@/types/us-states';

const STATES: UsState[] = [
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
];

describe('filterUsStates', () => {
  it('returns all states when query is empty/whitespace', () => {
    expect(filterUsStates(STATES, '')).toEqual(STATES);
    expect(filterUsStates(STATES, '   ')).toEqual(STATES);
  });

  it('matches by name (case-insensitive)', () => {
    expect(filterUsStates(STATES, 'cal')).toEqual([{ code: 'CA', name: 'California' }]);
    expect(filterUsStates(STATES, 'NEW')).toEqual([{ code: 'NY', name: 'New York' }]);
  });

  it('matches by code', () => {
    expect(filterUsStates(STATES, 'tx')).toEqual([{ code: 'TX', name: 'Texas' }]);
  });
});

