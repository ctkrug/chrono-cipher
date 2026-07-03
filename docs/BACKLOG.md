# Backlog

Epics and stories for the BUILD phase. High-level on purpose — each story should be small
enough to land as one focused commit or a short commit sequence.

## Epic 1 — Interactive solving

- [x] Render the ciphertext as individual letter cells (not a plain paragraph) so each cipher
      letter can carry its own guessed-plaintext state.
- [x] Add an on-screen substitution keyboard: selecting a cipher letter then a plaintext letter
      maps every matching cipher-letter cell in the document at once.
- [x] Support physical keyboard input as an alternative to clicking (type a letter to guess the
      currently selected cipher symbol).
- [x] Detect the solved state (every cipher letter mapped to the correct plaintext letter) and
      transition the app into the win flow.
- [x] Design polish: letter-entry tween (typewriter flip), wrong-guess shake/flash, and
      correct-guess pulse across all matching cells, per `docs/DESIGN.md`'s juice plan.

## Epic 2 — Frequency-evidence & hints

- [x] Build the evidence-board UI: a live-updating ranked list of ciphertext letters by
      frequency, redrawing as guesses are made.
- [x] Add a "request hint" action that calls `nextHint` and reveals that letter's mapping,
      incrementing a hint counter.
- [x] Disable/mark hinted cipher letters distinctly from player-deduced ones so the two are
      visually distinguishable (feeds the emoji-grid green/yellow split).
- [x] Design polish: style the evidence panel as a pinned "case notes" board (not a bare list)
      and make its mobile collapse (horizontal scroller) match the layout intent in
      `docs/DESIGN.md`.

## Epic 3 — Win flow & sharing

- [x] Build the win overlay: DECRYPTED stamp animation, full plaintext reveal (typed out
      letter-by-letter), quote author, and solve time.
- [x] Implement synth SFX via WebAudio for key-strike/correct/wrong/stamp-thud, with a mute
      toggle persisted to `localStorage` and lazy `AudioContext` creation on first gesture.
- [x] Wire `buildEmojiGrid` to a "copy result" button using the Clipboard API, with a toast/
      confirmation state.
- [x] Design polish: paper-dust particle scatter on win, respecting `prefers-reduced-motion` by
      dropping the animated overshoot while keeping the stamp and sound.

## Epic 4 — Persistence, accessibility, and cross-device QA

- [x] Persist per-day solve state to `localStorage` so a reload mid-solve doesn't lose progress,
      and mark days already solved so revisiting shows the win state directly.
- [x] Add keyboard focus management and `aria-live` status announcements for guesses, hints, and
      the win state; ensure icon-only buttons (mute, hint) have `aria-label`s.
- [x] Add touch-friendly tap targets (≥44px) for the on-screen keyboard and verify no horizontal
      scroll/overlap at 390px, 768px, and 1440px.
- [x] Design self-review pass: squint test for hierarchy, full keyboard tab-through, and a full
      play-through confirming sound, mute persistence, and the win celebration all fire, per
      `docs/DESIGN.md` D3.
