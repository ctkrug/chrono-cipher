import type { LetterReveal } from './game';

export interface StoredProgress {
  mapping: Record<string, string>;
  reveals: LetterReveal[];
  hintsUsed: number;
  startedAtMs: number;
  solved: boolean;
  solveTimeMs: number | null;
}

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

const KEY_PREFIX = 'chrono-cipher:progress:';

export function progressKey(dayNumber: number): string {
  return `${KEY_PREFIX}${dayNumber}`;
}

export function saveProgress(storage: WritableStorage, dayNumber: number, progress: StoredProgress): void {
  storage.setItem(progressKey(dayNumber), JSON.stringify(progress));
}

/** Returns null for a missing or corrupt record rather than throwing. */
export function loadProgress(storage: ReadableStorage, dayNumber: number): StoredProgress | null {
  const raw = storage.getItem(progressKey(dayNumber));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return null;
  }
}
