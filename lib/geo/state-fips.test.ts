import { describe, expect, it } from 'vitest';
import { STATE_ABBR_TO_FIPS } from './state-fips';

describe('STATE_ABBR_TO_FIPS', () => {
  it('includes DC and common states', () => {
    expect(STATE_ABBR_TO_FIPS.DC).toBe(11);
    expect(STATE_ABBR_TO_FIPS.CO).toBe(8);
    expect(STATE_ABBR_TO_FIPS.CA).toBe(6);
  });
});

