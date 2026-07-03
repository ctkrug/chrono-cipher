# Backlog

Epics and stories for the BUILD phase. High-level on purpose — each story should be small
enough to land as one focused commit or a short commit sequence.

## Epic 1 — Interactive solving

- [ ] Render the ciphertext as individual letter cells (not a plain paragraph) so each cipher
      letter can carry its own guessed-plaintext state.
- [ ] Add an on-screen substitution keyboard: selecting a cipher letter then a plaintext letter
      maps every matching cipher-letter cell in the document at once.
- [ ] Support physical keyboard input as an alternative to clicking (type a letter to guess the
      currently selected cipher symbol).
- [ ] Detect the solved state (every cipher letter mapped to the correct plaintext letter) and
      transition the app into the win flow.
- [ ] Design polish: letter-entry tween (typewriter flip), wrong-guess shake/flash, and
      correct-guess pulse across all matching cells, per `docs/DESIGN.md`'s juice plan.

## Epic 2 — Frequency-evidence & hints

- [ ] Build the evidence-board UI: a live-updating ranked list of ciphertext letters by
      frequency, redrawing as guesses are made.
- [ ] Add a "request hint" action that calls `nextHint` and reveals that letter's mapping,
      incrementing a hint counter.
- [ ] Disable/mark hinted cipher letters distinctly from player-deduced ones so the two are
      visually distinguishable (feeds the emoji-grid green/yellow split).
- [ ] Design polish: style the evidence panel as a pinned "case notes" board (not a bare list)
      and make its mobile collapse (horizontal scroller) match the layout intent in
      `docs/DESIGN.md`.

## Epic 3 — Win flow & sharing

- [ ] Build the win overlay: DECRYPTED stamp animation, full plaintext reveal (typed out
      letter-by-letter), quote author, and solve time.
- [ ] Implement synth SFX via WebAudio for key-strike/correct/wrong/stamp-thud, with a mute
      toggle persisted to `localStorage` and lazy `AudioContext` creation on first gesture.
- [ ] Wire `buildEmojiGrid` to a "copy result" button using the Clipboard API, with a toast/
      confirmation state.
- [ ] Design polish: paper-dust particle scatter on win, respecting `prefers-reduced-motion` by
      dropping the animated overshoot while keeping the stamp and sound.

## Epic 4 — Persistence, accessibility, and cross-device QA

- [ ] Persist per-day solve state to `localStorage` so a reload mid-solve doesn't lose progress,
      and mark days already solved so revisiting shows the win state directly.
- [ ] Add keyboard focus management and `aria-live` status announcements for guesses, hints, and
      the win state; ensure icon-only buttons (mute, hint) have `aria-label`s.
- [ ] Add touch-friendly tap targets (≥44px) for the on-screen keyboard and verify no horizontal
      scroll/overlap at 390px, 768px, and 1440px.
- [ ] Design self-review pass: squint test for hierarchy, full keyboard tab-through, and a full
      play-through confirming sound, mute persistence, and the win celebration all fire, per
      `docs/DESIGN.md` D3.
