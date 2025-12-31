import { describe, expect, it, vi } from 'vitest';
import { listUsStates } from './us-states';

describe('listUsStates', () => {
  it('queries states from the database', async () => {
    const expected = [
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
    ];

    const orderBy = vi.fn(async () => expected);
    const from = vi.fn(() => ({ orderBy }));
    const select = vi.fn(() => ({ from }));

    const db = { select };
    const result = await listUsStates(db as any);

    expect(result).toEqual(expected);
    expect(select).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledTimes(1);
    expect(orderBy).toHaveBeenCalledTimes(1);
  });
});

