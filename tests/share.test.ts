import { describe, expect, it } from 'vitest';
import { buildEmojiGrid, formatSolveTime } from '../src/share';

describe('formatSolveTime', () => {
  it('formats sub-minute times', () => {
    expect(formatSolveTime(45_000)).toBe('0:45');
  });

  it('pads single-digit seconds', () => {
    expect(formatSolveTime(65_000)).toBe('1:05');
  });

  it('floors partial seconds', () => {
    expect(formatSolveTime(1_999)).toBe('0:01');
  });

  it('formats zero as 0:00', () => {
    expect(formatSolveTime(0)).toBe('0:00');
  });

  it('keeps counting minutes past the one-hour mark', () => {
    expect(formatSolveTime(3_661_000)).toBe('61:01');
  });
});

describe('buildEmojiGrid', () => {
  it('includes the day number and formatted time in the header', () => {
    const grid = buildEmojiGrid({
      dayNumber: 12,
      solveTimeMs: 90_000,
      hintsUsed: 0,
      guesses: [true, true, true],
    });
    expect(grid).toContain('Chrono Cipher #12 — 1:30');
    expect(grid).toContain('no hints used');
  });

  it('renders green squares for deduced letters and yellow for hinted ones', () => {
    const grid = buildEmojiGrid({
      dayNumber: 1,
      solveTimeMs: 0,
      hintsUsed: 1,
      guesses: [true, false],
    });
    expect(grid).toContain('🟩🟨');
    expect(grid).toContain('1 hint used');
  });

  it('has no way to encode the plaintext quote (only accepts booleans per letter)', () => {
    const grid = buildEmojiGrid({
      dayNumber: 1,
      solveTimeMs: 0,
      hintsUsed: 0,
      guesses: [true, false, true],
    });
    expect(grid).toMatch(/^Chrono Cipher #1 — 0:00\n(?:🟩|🟨)+\nno hints used$/u);
  });

  it('wraps the grid onto multiple rows of 6 squares', () => {
    const grid = buildEmojiGrid({
      dayNumber: 3,
      solveTimeMs: 0,
      hintsUsed: 0,
      guesses: [true, true, true, true, true, true, true, false],
    });
    const rows = grid.split('\n').slice(1, -1);
    expect(rows).toEqual(['🟩🟩🟩🟩🟩🟩', '🟩🟨']);
  });

  it('pluralizes the hint count', () => {
    const grid = buildEmojiGrid({ dayNumber: 1, solveTimeMs: 0, hintsUsed: 3, guesses: [false] });
    expect(grid).toContain('3 hints used');
  });

  it('omits the grid body entirely when there are no reveals', () => {
    const grid = buildEmojiGrid({ dayNumber: 1, solveTimeMs: 0, hintsUsed: 0, guesses: [] });
    expect(grid).toBe('Chrono Cipher #1 — 0:00\n\nno hints used');
  });
});
