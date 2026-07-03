// Day zero for the daily puzzle counter. Chosen arbitrarily; only the delta
// from this date matters, not the date itself.
const EPOCH_UTC_MS = Date.UTC(2026, 0, 1);
const MS_PER_DAY = 86_400_000;

/** Number of whole UTC days since the puzzle epoch, used as the daily case number. */
export function dayNumber(date: Date): number {
  const dateUtcMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((dateUtcMs - EPOCH_UTC_MS) / MS_PER_DAY);
}

/** Seed derived from the day number; offset by one so day 0 never seeds a PRNG with 0. */
export function dailySeed(date: Date): number {
  return dayNumber(date) + 1;
}

/**
 * mulberry32: a small, fast, deterministic PRNG. Used instead of Math.random()
 * so the same seed always reproduces the same puzzle for every player.
 */
export function mulberry32(seed: number): () => number {
  let state = seed;
  return function random(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
