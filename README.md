# Chrono Cipher

A daily puzzle: crack a substitution cipher hiding a short historical quote, then share your
solve time as an emoji grid.

Every quote is enciphered with a letter-substitution scheme seeded deterministically from the
calendar date, so everyone gets the same puzzle on the same day — no server, no accounts, no
tracking. A from-scratch frequency-analysis engine studies the ciphertext the way a real
cryptanalyst would and offers ranked hints instead of just handing you the answer.

## Why

Wordle-likes are everywhere; most are re-skins of the same five-guess loop. Chrono Cipher is
built around a genuinely different mechanic — classical cryptanalysis — and treats the "hint"
system as a small puzzle-design problem in its own right: which letter should the game reveal
next, and why, given only frequency statistics?

## Planned features

- **Daily puzzle** — deterministic, date-seeded substitution cipher over a rotating set of
  short historical quotes (with attribution).
- **Frequency-analysis hint engine** — ranks ciphertext letters by observed frequency against
  standard English letter frequencies and suggests the next most-informative reveal.
- **Emoji-grid sharing** — a Wordle-style shareable result grid encoding solve time and hints
  used, with no spoilers.
- **A "declassified dossier" presentation** — the puzzle reads like a redacted intelligence
  file; solving it stamps the document "DECRYPTED."

## Stack

- **TypeScript**, bundled and served as a static site with [Vite](https://vitejs.dev/).
- **Vitest** for unit tests of the cipher, frequency-analysis, and sharing logic.
- **ESLint** (flat config, `typescript-eslint`) for linting.
- No backend, no database, no build-time secrets — the entire game ships as static assets and
  runs client-side.

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the full design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
npm test         # run the unit test suite
npm run lint      # lint the codebase
```

## License

MIT — see [`LICENSE`](LICENSE).
