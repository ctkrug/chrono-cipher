# Chrono Cipher

**▶ Live demo: [apps.charliekrug.com/chrono-cipher](https://apps.charliekrug.com/chrono-cipher/)**

Decode history, one cipher a day. A daily puzzle where you crack a substitution cipher hiding a
short historical quote, then share your solve time as a spoiler-free emoji grid.

[![CI](https://github.com/ctkrug/chrono-cipher/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/chrono-cipher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What it is

If you already crack a word puzzle with your morning coffee, Chrono Cipher gives you a different
skill to flex: codebreaking. Each day a famous quote is enciphered with a letter-substitution
scheme, and you solve it the way a real cryptanalyst would, by reasoning from letter frequency
instead of guessing whole words.

The cipher is seeded from the calendar date, so everyone gets the same puzzle on the same day.
There is no server, no account, and no tracking. Your progress lives in your own browser.

## How you solve it

Pick a symbol in the coded message, then choose the plaintext letter you think it stands for.
Guess right and every copy of that symbol flips over across the whole document at once. Guess
wrong and the cell shakes, so you try again. A frequency panel ranks every symbol by how often
it appears, because the most common symbol is usually E, T, or A, and a "Request hint" button
reveals the most useful next letter when you are stuck.

Crack the last letter and the file gets stamped **DECRYPTED**: the quote types itself out with
its author and your solve time, and you can copy a shareable result grid.

## Sample result

The share text is spoiler-free. It shows your time and which letters you deduced (green) versus
revealed with a hint (yellow), never the quote itself:

```
Chrono Cipher #184 — 2:47
🟩🟩🟩🟨🟩🟩
🟩🟩🟩🟩🟨
1 hint used
```

## Features

- **A new cipher every day.** A deterministic, date-seeded substitution cipher over a rotating
  set of short historical quotes, each shown with its author once you solve it.
- **A real frequency-analysis panel.** Live-ranked ciphertext letters by observed frequency, so
  you can spot the likely E or T yourself instead of guessing blind.
- **Hints that cost you something.** The hint reveals the most informative next letter and marks
  it yellow in your share grid, so there is a visible trade-off to using one.
- **Spoiler-free sharing.** One-click copy of a Wordle-style emoji grid encoding your solve time
  and hint count, safe to post before others have played.
- **Resumable, offline-friendly.** Mid-solve state and already-solved days persist to
  `localStorage`, so a reload never loses progress. The whole game is static files, no backend.
- **A declassified-dossier look.** The puzzle reads like a redacted intelligence file, with a
  DECRYPTED rubber-stamp win moment, paper-dust particles, and synthesized sound effects.

## Development

```sh
npm install
npm run dev    # local dev server
npm run build  # type-check + production build
npm test       # run the unit test suite (Vitest)
npm run lint   # lint the codebase (ESLint)
```

The cipher, frequency-analysis, sharing, and persistence logic are pure TypeScript modules with
unit tests in [`tests/`](tests). See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the code
map, [`docs/DESIGN.md`](docs/DESIGN.md) for the visual direction, and
[`docs/VISION.md`](docs/VISION.md) for the design rationale.

## License

MIT, see [`LICENSE`](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
