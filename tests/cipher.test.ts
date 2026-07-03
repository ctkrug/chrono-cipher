import { describe, expect, it } from 'vitest';
import { buildPuzzle, buildSubstitutionMap, encode } from '../src/cipher';

describe('buildSubstitutionMap', () => {
  it('is a derangement: no letter maps to itself', () => {
    const map = buildSubstitutionMap(42);
    for (const [cipherLetter, plainLetter] of Object.entries(map)) {
      expect(cipherLetter).not.toBe(plainLetter);
    }
  });

  it('is a bijection covering all 26 letters', () => {
    const map = buildSubstitutionMap(7);
    const plainLetters = new Set(Object.values(map));
    expect(Object.keys(map)).toHaveLength(26);
    expect(plainLetters.size).toBe(26);
  });

  it('is deterministic for the same seed', () => {
    expect(buildSubstitutionMap(99)).toEqual(buildSubstitutionMap(99));
  });
});

describe('encode', () => {
  it('preserves punctuation and spacing', () => {
    const map = buildSubstitutionMap(1);
    const encoded = encode("It's a test!", map);
    expect(encoded).toMatch(/^[A-Z]+'[A-Z] [A-Z] [A-Z]+!$/);
  });

  it('round-trips through the inverse mapping', () => {
    const map = buildSubstitutionMap(3);
    const inverse: Record<string, string> = {};
    for (const [cipher, plain] of Object.entries(map)) inverse[plain] = cipher;

    const plaintext = 'HELLO WORLD';
    const encoded = encode(plaintext, map);
    const decoded = encode(encoded, inverse);
    expect(decoded).toBe(plaintext);
  });
});

describe('buildPuzzle', () => {
  it('produces the same puzzle for the same seed and quote', () => {
    const quote = { text: 'Test quote.', author: 'Nobody' };
    const a = buildPuzzle(5, quote);
    const b = buildPuzzle(5, quote);
    expect(a).toEqual(b);
  });

  it('uppercases the plaintext', () => {
    const puzzle = buildPuzzle(5, { text: 'lowercase text', author: 'Nobody' });
    expect(puzzle.plaintext).toBe('LOWERCASE TEXT');
  });
});
