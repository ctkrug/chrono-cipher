import { describe, expect, it } from 'vitest';
import { dailySeed, dayNumber, mulberry32 } from '../src/daily';

describe('dayNumber', () => {
  it('is deterministic for the same UTC date', () => {
    const a = dayNumber(new Date('2026-03-15T09:00:00Z'));
    const b = dayNumber(new Date('2026-03-15T23:59:59Z'));
    expect(a).toBe(b);
  });

  it('increases by exactly one per UTC day', () => {
    const day1 = dayNumber(new Date('2026-03-15T00:00:00Z'));
    const day2 = dayNumber(new Date('2026-03-16T00:00:00Z'));
    expect(day2 - day1).toBe(1);
  });

  it('is negative for dates before the epoch', () => {
    expect(dayNumber(new Date('2025-12-31T00:00:00Z'))).toBe(-1);
  });

  it('is unaffected by local timezone offsets within the same UTC day', () => {
    const a = dayNumber(new Date('2026-03-15T00:00:00+12:00'));
    const b = dayNumber(new Date('2026-03-15T00:00:00-12:00'));
    expect(b - a).toBe(1);
  });
});

describe('dailySeed', () => {
  it('is never zero, even on the epoch day', () => {
    expect(dailySeed(new Date('2026-01-01T00:00:00Z'))).not.toBe(0);
  });
});

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const sequenceA = [a(), a(), a()];
    const sequenceB = [b(), b(), b()];
    expect(sequenceA).toEqual(sequenceB);
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it('always returns values in [0, 1)', () => {
    const random = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
