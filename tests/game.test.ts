import { describe, expect, it } from 'vitest';
import { buildPuzzle } from '../src/cipher';
import { applyGuess, applyHint, createGameState, isSolved, toSolveResult, uniqueCipherLetters } from '../src/game';

const quote = { text: 'BE BOLD', author: 'Nobody' };
const puzzle = buildPuzzle(11, quote);
const [cipherA, plainA] = Object.entries(puzzle.solution)[0];

describe('uniqueCipherLetters', () => {
  it('returns each distinct letter once, ignoring spaces and punctuation', () => {
    expect(uniqueCipherLetters('AAB, B!')).toEqual(['A', 'B']);
  });
});

describe('applyGuess', () => {
  it('records a correct guess and leaves a reveal entry', () => {
    const state = createGameState(puzzle);
    const outcome = applyGuess(state, cipherA, plainA);
    expect(outcome.correct).toBe(true);
    expect(outcome.state.mapping[cipherA]).toBe(plainA);
    expect(outcome.state.reveals).toEqual([{ cipherLetter: cipherA, hinted: false }]);
  });

  it('leaves state untouched on an incorrect guess', () => {
    const state = createGameState(puzzle);
    const wrongLetter = plainA === 'Z' ? 'Y' : 'Z';
    const outcome = applyGuess(state, cipherA, wrongLetter);
    expect(outcome.correct).toBe(false);
    expect(outcome.state).toBe(state);
  });

  it('is idempotent once a cipher letter is already solved', () => {
    const solved = applyGuess(createGameState(puzzle), cipherA, plainA).state;
    const outcome = applyGuess(solved, cipherA, plainA);
    expect(outcome.correct).toBe(true);
    expect(outcome.state.reveals).toHaveLength(1);
  });
});

describe('applyHint', () => {
  it('reveals a letter and marks it hinted', () => {
    const { state, hint } = applyHint(createGameState(puzzle));
    expect(hint).not.toBeNull();
    expect(state.hintsUsed).toBe(1);
    expect(state.reveals[0].hinted).toBe(true);
    expect(state.mapping[hint!.cipherLetter]).toBe(puzzle.solution[hint!.cipherLetter]);
  });

  it('returns null once every letter is already solved', () => {
    let state = createGameState(puzzle);
    for (const letter of uniqueCipherLetters(puzzle.ciphertext)) {
      state = applyGuess(state, letter, puzzle.solution[letter]).state;
    }
    const outcome = applyHint(state);
    expect(outcome.hint).toBeNull();
    expect(outcome.state).toBe(state);
  });
});

describe('isSolved', () => {
  it('is false until every cipher letter is mapped', () => {
    expect(isSolved(createGameState(puzzle))).toBe(false);
  });

  it('is true once every cipher letter is mapped', () => {
    let state = createGameState(puzzle);
    for (const letter of uniqueCipherLetters(puzzle.ciphertext)) {
      state = applyGuess(state, letter, puzzle.solution[letter]).state;
    }
    expect(isSolved(state)).toBe(true);
  });
});

describe('toSolveResult', () => {
  it('maps reveals to booleans in solve order for the share grid', () => {
    let state = createGameState(puzzle);
    state = applyGuess(state, cipherA, plainA).state;
    state = applyHint(state).state;
    const result = toSolveResult(state, 12, 5_000);
    expect(result).toEqual({
      dayNumber: 12,
      solveTimeMs: 5_000,
      hintsUsed: 1,
      guesses: [true, false],
    });
  });
});
