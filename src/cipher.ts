import { mulberry32 } from './daily';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface Quote {
  text: string;
  author: string;
}

export interface CipherPuzzle {
  ciphertext: string;
  plaintext: string;
  /** cipher letter -> plaintext letter; this is the solution the player is solving toward. */
  solution: Record<string, string>;
  author: string;
}

function shuffledAlphabet(random: () => number): string[] {
  const letters = ALPHABET.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters;
}

function isDerangement(shuffled: string[]): boolean {
  return shuffled.every((letter, i) => letter !== ALPHABET[i]);
}

/**
 * Builds a random substitution alphabet for the given seed. Rerolls until no
 * letter maps to itself, so the puzzle never leaks a free letter.
 */
export function buildSubstitutionMap(seed: number): Record<string, string> {
  const random = mulberry32(seed);
  let shuffled = shuffledAlphabet(random);
  let attempts = 0;
  while (!isDerangement(shuffled) && attempts < 50) {
    shuffled = shuffledAlphabet(random);
    attempts += 1;
  }

  const cipherToPlain: Record<string, string> = {};
  ALPHABET.split('').forEach((plainLetter, i) => {
    cipherToPlain[shuffled[i]] = plainLetter;
  });
  return cipherToPlain;
}

export function encode(plaintext: string, cipherToPlain: Record<string, string>): string {
  const plainToCipher: Record<string, string> = {};
  for (const [cipherLetter, plainLetter] of Object.entries(cipherToPlain)) {
    plainToCipher[plainLetter] = cipherLetter;
  }

  return plaintext
    .toUpperCase()
    .split('')
    .map((char) => plainToCipher[char] ?? char)
    .join('');
}

export function buildPuzzle(seed: number, quote: Quote): CipherPuzzle {
  const solution = buildSubstitutionMap(seed);
  return {
    ciphertext: encode(quote.text, solution),
    plaintext: quote.text.toUpperCase(),
    solution,
    author: quote.author,
  };
}
