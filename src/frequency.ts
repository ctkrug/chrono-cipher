export function letterCounts(ciphertext: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const char of ciphertext) {
    if (!/[A-Z]/.test(char)) continue;
    counts[char] = (counts[char] ?? 0) + 1;
  }
  return counts;
}

export interface FrequencyRank {
  cipherLetter: string;
  count: number;
  /** 1 = most frequent cipher letter in this ciphertext. */
  rank: number;
}

/** Ranks the letters actually appearing in the ciphertext by observed frequency. */
export function rankByFrequency(ciphertext: string): FrequencyRank[] {
  const counts = letterCounts(ciphertext);
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([cipherLetter, count], index) => ({ cipherLetter, count, rank: index + 1 }));
}

export interface Hint {
  cipherLetter: string;
  plainLetter: string;
}

/**
 * Picks the next letter to reveal: the highest-frequency cipher letter the
 * player hasn't solved yet. This mirrors real classical cryptanalysis, where
 * the most common ciphertext symbol is the best first guess at "E" or "T".
 */
export function nextHint(
  ciphertext: string,
  solved: ReadonlySet<string>,
  solution: Record<string, string>,
): Hint | null {
  const unsolved = rankByFrequency(ciphertext).filter((entry) => !solved.has(entry.cipherLetter));
  if (unsolved.length === 0) return null;

  const { cipherLetter } = unsolved[0];
  return { cipherLetter, plainLetter: solution[cipherLetter] };
}
