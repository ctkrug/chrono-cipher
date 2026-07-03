import { describe, expect, it } from 'vitest';
import { letterCounts, nextHint, rankByFrequency } from '../src/frequency';

describe('letterCounts', () => {
  it('counts only letters, ignoring punctuation and spaces', () => {
    expect(letterCounts("AA BB, C!")).toEqual({ A: 2, B: 2, C: 1 });
  });
});

describe('rankByFrequency', () => {
  it('sorts descending by count', () => {
    const ranked = rankByFrequency('AAABBC');
    expect(ranked.map((r) => r.cipherLetter)).toEqual(['A', 'B', 'C']);
    expect(ranked[0].count).toBe(3);
    expect(ranked[0].rank).toBe(1);
  });
});

describe('nextHint', () => {
  const ciphertext = 'XXXYYZ';
  const solution = { X: 'E', Y: 'T', Z: 'A' };

  it('reveals the highest-frequency unsolved letter first', () => {
    const hint = nextHint(ciphertext, new Set(), solution);
    expect(hint).toEqual({ cipherLetter: 'X', plainLetter: 'E' });
  });

  it('skips letters already marked solved', () => {
    const hint = nextHint(ciphertext, new Set(['X']), solution);
    expect(hint).toEqual({ cipherLetter: 'Y', plainLetter: 'T' });
  });

  it('returns null once every letter is solved', () => {
    const hint = nextHint(ciphertext, new Set(['X', 'Y', 'Z']), solution);
    expect(hint).toBeNull();
  });
});
