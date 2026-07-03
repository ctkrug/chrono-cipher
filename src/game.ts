import type { CipherPuzzle } from './cipher';
import { nextHint } from './frequency';
import type { SolveResult } from './share';

export interface LetterReveal {
  cipherLetter: string;
  hinted: boolean;
}

export interface GameState {
  puzzle: CipherPuzzle;
  /** cipher letter -> guessed plaintext letter, present only once solved. */
  mapping: Record<string, string>;
  /** order in which cipher letters were solved, by deduction or by hint. */
  reveals: LetterReveal[];
  hintsUsed: number;
}

export function createGameState(puzzle: CipherPuzzle): GameState {
  return { puzzle, mapping: {}, reveals: [], hintsUsed: 0 };
}

/** The distinct cipher letters that actually appear in the ciphertext. */
export function uniqueCipherLetters(ciphertext: string): string[] {
  return Array.from(new Set(ciphertext.split('').filter((char) => /[A-Z]/.test(char))));
}

export interface GuessOutcome {
  state: GameState;
  correct: boolean;
}

/**
 * Applies a player's proposed cipher-letter -> plaintext-letter guess. A
 * correct guess is recorded permanently; an incorrect guess leaves the state
 * untouched so the caller can trigger wrong-guess feedback.
 */
export function applyGuess(state: GameState, cipherLetter: string, plainLetter: string): GuessOutcome {
  if (state.mapping[cipherLetter]) {
    return { state, correct: state.mapping[cipherLetter] === plainLetter };
  }

  const correct = state.puzzle.solution[cipherLetter] === plainLetter;
  if (!correct) {
    return { state, correct: false };
  }

  return {
    state: {
      ...state,
      mapping: { ...state.mapping, [cipherLetter]: plainLetter },
      reveals: [...state.reveals, { cipherLetter, hinted: false }],
    },
    correct: true,
  };
}

/** Reveals the next best letter via frequency analysis, if any remain unsolved. */
export function applyHint(state: GameState): { state: GameState; hint: LetterReveal | null } {
  const solved = new Set(Object.keys(state.mapping));
  const hint = nextHint(state.puzzle.ciphertext, solved, state.puzzle.solution);
  if (!hint) return { state, hint: null };

  const reveal: LetterReveal = { cipherLetter: hint.cipherLetter, hinted: true };
  return {
    state: {
      ...state,
      mapping: { ...state.mapping, [hint.cipherLetter]: hint.plainLetter },
      reveals: [...state.reveals, reveal],
      hintsUsed: state.hintsUsed + 1,
    },
    hint: reveal,
  };
}

/** True once every cipher letter appearing in the ciphertext has been mapped. */
export function isSolved(state: GameState): boolean {
  return uniqueCipherLetters(state.puzzle.ciphertext).every((letter) => letter in state.mapping);
}

export function toSolveResult(state: GameState, dayNumber: number, solveTimeMs: number): SolveResult {
  return {
    dayNumber,
    solveTimeMs,
    hintsUsed: state.hintsUsed,
    guesses: state.reveals.map((reveal) => !reveal.hinted),
  };
}
