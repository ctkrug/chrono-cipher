# Architecture

Static TypeScript/Vite site, no backend. `index.html` loads `src/main.ts`, which renders the
whole app by rebuilding `#app`'s `innerHTML` on every state change and re-attaching listeners.

## Modules

**Pure logic (unit-tested in `tests/`, no DOM):**

- `daily.ts` — `dayNumber`/`dailySeed` turn a `Date` into a deterministic per-UTC-day case
  number and PRNG seed; `mulberry32` is the seeded PRNG used everywhere randomness is needed.
- `cipher.ts` — `buildSubstitutionMap` builds a derangement substitution alphabet from a seed;
  `encode`/`buildPuzzle` produce a `CipherPuzzle` (ciphertext, plaintext, solution map, author).
- `quotes.ts` — the `QUOTES` dataset and `quoteForDay`, which wraps the day number into it.
- `frequency.ts` — `rankByFrequency` (observed letter counts, descending) and `nextHint`
  (highest-frequency unsolved cipher letter), the actual cryptanalysis the game teaches.
- `game.ts` — `GameState` (mapping/reveals/hintsUsed) plus `applyGuess`/`applyHint`/`isSolved`/
  `toSolveResult`: pure state transitions the UI layer calls into, with no DOM knowledge.
- `share.ts` — `formatSolveTime` and `buildEmojiGrid`, the spoiler-free Wordle-style share text.
- `persistence.ts` — `saveProgress`/`loadProgress`, keyed by day number, storage-agnostic (an
  injectable `{getItem,setItem}` so it's testable without a real `localStorage`).
- `mute.ts` — `createMuteState` wraps a persisted mute flag so the SFX player and the header
  mute button share one source of truth.
- `audio.ts` — `createSfxPlayer` synthesizes key-strike/correct/wrong/stamp-thud SFX from
  WebAudio oscillators and a noise buffer; lazily creates its `AudioContext` and is a no-op
  when muted or when `AudioContext` isn't available (tests, unsupported browsers).

**Wiring (`main.ts`, not unit-tested — verified by running the app):**

- Holds `AppState` (puzzle, `GameState`, selection, transient animation flags, mute/SFX
  instances, win/solve-time fields) and a single `render(root, state)` that rebuilds the DOM
  from it: cipher-cell document, frequency evidence board, on-screen keyboard, and the win
  overlay when solved.
- `guess`/`requestHint` call into `game.ts`, persist via `persistence.ts`, play SFX, set a
  transient `lastAction` (cleared after `FEEDBACK_DURATION_MS`) that drives the pulse/shake
  CSS animations, and check `isSolved` to trigger the win celebration exactly once.
- On mount, restores any stored progress for today's day number so a reload resumes instead of
  restarting; a day already solved renders the win overlay directly.

## Data flow

`Date → dayNumber/dailySeed → buildPuzzle (cipher.ts + quotes.ts) → GameState (game.ts)`, then
every guess/hint flows `AppState mutation → persist → render → transient-class cleanup`. Nothing
survives across runs except what's explicitly written to `localStorage` via `persistence.ts`
and `mute.ts`.

## Styling

Single `src/style.css`, hand-written (no framework), following the tokens/type-pairing in
`docs/DESIGN.md` (aged-paper "declassified dossier" palette, Special Elite + Source Serif 4).
BEM-ish class names scoped by component: `dossier__*` (page shell/document), `evidence__*`
(frequency board), `keyboard__*` (on-screen keyboard), `win__*` (win overlay).

## Run / test

- `npm run dev` — Vite dev server.
- `npm test` — `vitest run` over `tests/*.test.ts` (unit tests for every pure module above).
- `npm run build` — `tsc --noEmit` then `vite build` to `dist/`; base path is relative (`./`)
  so it serves correctly from a subpath (`apps.charliekrug.com/chrono-cipher`).
- `npm run lint` — ESLint over the whole project.
