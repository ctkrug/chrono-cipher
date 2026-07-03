import { describe, expect, it } from 'vitest';
import { QUOTES, quoteForDay } from '../src/quotes';

describe('quoteForDay', () => {
  it('returns the first quote on day 0', () => {
    expect(quoteForDay(0)).toBe(QUOTES[0]);
  });

  it('wraps around once the day count exceeds the quote list', () => {
    expect(quoteForDay(QUOTES.length)).toBe(QUOTES[0]);
    expect(quoteForDay(QUOTES.length + 2)).toBe(QUOTES[2]);
  });

  it('wraps positively for negative day numbers', () => {
    expect(quoteForDay(-1)).toBe(QUOTES[QUOTES.length - 1]);
    expect(quoteForDay(-QUOTES.length)).toBe(QUOTES[0]);
  });

  it('every quote has non-empty text and author', () => {
    for (const quote of QUOTES) {
      expect(quote.text.trim().length).toBeGreaterThan(0);
      expect(quote.author.trim().length).toBeGreaterThan(0);
    }
  });
});
