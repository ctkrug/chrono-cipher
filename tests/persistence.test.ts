import { describe, expect, it } from 'vitest';
import { loadProgress, progressKey, saveProgress, type StoredProgress } from '../src/persistence';

function createMockStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

const sampleProgress: StoredProgress = {
  mapping: { A: 'E' },
  reveals: [{ cipherLetter: 'A', hinted: false }],
  hintsUsed: 0,
  startedAtMs: 1_000,
  solved: false,
  solveTimeMs: null,
};

describe('progressKey', () => {
  it('namespaces by day number', () => {
    expect(progressKey(5)).not.toBe(progressKey(6));
  });
});

describe('saveProgress / loadProgress', () => {
  it('round-trips a stored progress record', () => {
    const storage = createMockStorage();
    saveProgress(storage, 5, sampleProgress);
    expect(loadProgress(storage, 5)).toEqual(sampleProgress);
  });

  it('returns null when nothing is stored for that day', () => {
    const storage = createMockStorage();
    expect(loadProgress(storage, 99)).toBeNull();
  });

  it('returns null instead of throwing on corrupt JSON', () => {
    const storage = createMockStorage();
    storage.setItem(progressKey(2), '{not json');
    expect(loadProgress(storage, 2)).toBeNull();
  });

  it('keeps different days independent', () => {
    const storage = createMockStorage();
    saveProgress(storage, 1, sampleProgress);
    expect(loadProgress(storage, 2)).toBeNull();
  });

  it('returns null for valid JSON that is not a progress record', () => {
    const storage = createMockStorage();
    storage.setItem(progressKey(3), JSON.stringify({ unrelated: true }));
    expect(loadProgress(storage, 3)).toBeNull();
  });

  it('returns null for valid JSON with the wrong field types', () => {
    const storage = createMockStorage();
    storage.setItem(progressKey(4), JSON.stringify({ ...sampleProgress, reveals: 'not-an-array' }));
    expect(loadProgress(storage, 4)).toBeNull();
  });

  it('returns null for a bare JSON array or primitive', () => {
    const storage = createMockStorage();
    storage.setItem(progressKey(6), JSON.stringify([1, 2, 3]));
    expect(loadProgress(storage, 6)).toBeNull();
  });

  it('does not throw when the underlying storage write fails', () => {
    const storage = {
      setItem: () => {
        throw new DOMException('QuotaExceededError');
      },
    };
    expect(() => saveProgress(storage, 5, sampleProgress)).not.toThrow();
  });
});
