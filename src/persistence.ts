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

/**
 * Best-effort save: swallows write failures (Safari private mode, quota
 * exceeded, storage disabled) so a persistence hiccup never breaks gameplay.
 */
export function saveProgress(storage: WritableStorage, dayNumber: number, progress: StoredProgress): void {
  try {
    storage.setItem(progressKey(dayNumber), JSON.stringify(progress));
  } catch {
    // Progress just won't survive a reload this session; the game itself still works.
  }
}

function isValidProgress(value: unknown): value is StoredProgress {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.mapping === 'object' &&
    record.mapping !== null &&
    Array.isArray(record.reveals) &&
    typeof record.hintsUsed === 'number' &&
    typeof record.startedAtMs === 'number' &&
    typeof record.solved === 'boolean' &&
    (record.solveTimeMs === null || typeof record.solveTimeMs === 'number')
  );
}

/** Returns null for a missing, corrupt, or malformed-but-valid-JSON record rather than throwing. */
export function loadProgress(storage: ReadableStorage, dayNumber: number): StoredProgress | null {
  const raw = storage.getItem(progressKey(dayNumber));
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return isValidProgress(parsed) ? parsed : null;
}
