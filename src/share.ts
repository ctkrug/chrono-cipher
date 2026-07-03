export interface SolveResult {
  dayNumber: number;
  solveTimeMs: number;
  hintsUsed: number;
  /** One row per letter reveal, in order; true = solved by deduction, false = revealed by hint. */
  guesses: boolean[];
}

const DEDUCED = '🟩';
const HINTED = '🟨';
const ROW_WIDTH = 6;

export function formatSolveTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function chunk(squares: string[], size: number): string[] {
  const rows: string[] = [];
  for (let i = 0; i < squares.length; i += size) {
    rows.push(squares.slice(i, i + size).join(''));
  }
  return rows;
}

/** Builds a spoiler-free, Wordle-style shareable summary of a solved puzzle. */
export function buildEmojiGrid(result: SolveResult): string {
  const header = `Chrono Cipher #${result.dayNumber} — ${formatSolveTime(result.solveTimeMs)}`;
  const squares = result.guesses.map((deduced) => (deduced ? DEDUCED : HINTED));
  const grid = chunk(squares, ROW_WIDTH).join('\n');
  const hintLine =
    result.hintsUsed === 0 ? 'no hints used' : `${result.hintsUsed} hint${result.hintsUsed === 1 ? '' : 's'} used`;

  return `${header}\n${grid}\n${hintLine}`;
}
