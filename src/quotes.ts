import type { Quote } from './cipher';

export type { Quote };

/**
 * Short, public-domain historical quotes. Kept brief on purpose: the cipher
 * gets harder to read the longer the ciphertext runs, so v1 favors quotable
 * lines over completeness.
 */
export const QUOTES: Quote[] = [
  { text: 'I came, I saw, I conquered.', author: 'Julius Caesar' },
  { text: 'Give me liberty, or give me death.', author: 'Patrick Henry' },
  { text: 'We have nothing to fear but fear itself.', author: 'Franklin D. Roosevelt' },
  { text: 'Ask not what your country can do for you.', author: 'John F. Kennedy' },
  {
    text: 'That is one small step for man, one giant leap for mankind.',
    author: 'Neil Armstrong',
  },
  { text: 'Let them eat cake.', author: 'Attributed to Marie Antoinette' },
  { text: 'Speak softly and carry a big stick.', author: 'Theodore Roosevelt' },
  { text: 'The only thing constant is change.', author: 'Heraclitus' },
  { text: 'Know thyself.', author: 'Inscribed at the Temple of Delphi' },
  { text: 'Fortune favors the bold.', author: 'Virgil' },
  { text: 'The die is cast.', author: 'Julius Caesar' },
  { text: 'In wine there is truth.', author: 'Pliny the Elder' },
  { text: 'A house divided against itself cannot stand.', author: 'Abraham Lincoln' },
  { text: 'The pen is mightier than the sword.', author: 'Edward Bulwer-Lytton' },
  { text: 'Where there is unity there is always victory.', author: 'Publilius Syrus' },
  { text: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien' },
  { text: 'What is done in love is done well.', author: 'Vincent van Gogh' },
  { text: 'Genius is one percent inspiration, ninety-nine percent perspiration.', author: 'Thomas Edison' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Veni, vidi, vici.', author: 'Julius Caesar' },
];

/** Wraps around the quote list so the daily counter never runs out of puzzles. */
export function quoteForDay(day: number): Quote {
  const index = ((day % QUOTES.length) + QUOTES.length) % QUOTES.length;
  return QUOTES[index];
}
