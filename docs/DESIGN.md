# Design direction

## Aesthetic direction

Chrono Cipher is a **declassified dossier**: the puzzle reads like a redacted intelligence file
pulled from an archive — aged paper, typewriter type, a red case stamp — and solving it is the
moment the file gets declassified in front of you.

This gives the cryptanalysis mechanic a costume that actually fits it, instead of defaulting to
a dark-mode "puzzle app" look. It's also intentionally warm and paper-toned, which keeps the
factory's portfolio from converging on yet another dark theme.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f4ecd8` | page background — aged paper |
| `--surface-1` | `#eadfc4` | document card background |
| `--surface-2` | `#ddcfa8` | recessed/evidence panel background |
| `--text` | `#2b2620` | primary ink |
| `--text-muted` | `#5f5344` | captions, metadata, case numbers |
| `--accent` | `#a13d2b` | stamp red — primary actions, the "DECRYPTED" stamp |
| `--accent-support` | `#2f4858` | navy ink — secondary actions, links, focus rings |
| `--success` | `#3f6b3f` | correct letter feedback |
| `--danger` | `#8c1f1f` | wrong-guess feedback (deeper than the accent red) |

**Type pairing:** display font **Special Elite** (a monospace typewriter face, via Google Fonts)
for the wordmark, case headers, and the ciphertext itself; UI font **Source Serif 4** for body
copy, labels, and buttons — readable at small sizes without breaking the document conceit.
System fallback stack: `'Special Elite', 'Courier New', monospace` and
`'Source Serif 4', Georgia, serif`.

**Spacing:** 8px base unit (8/16/24/32/48/64). **Corner radius:** 2px — paper has sharp corners,
not rounded ones; only the stamp graphic itself is circular. **Shadow:** a soft, low-opacity
double shadow under the document card to suggest a stack of paper underneath it, not a glow.
**Motion:** UI transitions 160ms ease-out; game feedback (letter entry, shake, pulse) 90ms
ease-out.

## Layout intent

The hero is **the document** — the encrypted quote itself, rendered as a case file. On
1440×900 desktop: the document sits center-left at roughly 60% of viewport width, with a
letter-frequency "evidence board" (ranked bar list + a manual substitution keyboard) as a
narrower sidebar to its right — like case notes pinned beside the file. Header (wordmark + case
number) is a slim strip above both, never competing for space with the document.

At 390×844 phone: the document stacks first (full width, ~55vh), the evidence board collapses
to a horizontal scroller of ranked letters beneath it, and the on-screen substitution keyboard
docks to the bottom of the viewport so thumbs can reach it without scrolling.

## Signature detail

A **"DECRYPTED" rubber stamp** slams down diagonally across the document on solve — CSS
keyframe animation (scale + rotate overshoot), timed with a low stamp-thud SFX. It's the one
moment of full-throttle motion in an otherwise calm, paper-still page.

## Juice plan

- **Movement tween:** typed/guessed letters flip into their cell over 100ms (rotateX 90°→0°),
  like a typewriter key strike — never an instant swap.
- **Impact feedback:** an incorrect substitution guess gives the cell a 90ms horizontal shake
  and a brief red-tinted flash.
- **Goal/success pop:** placing a letter correctly pulses every matching cell across the
  document simultaneously (scale 1→1.08→1, 120ms), showing the player their deduction landed
  everywhere at once.
- **Win celebration:** the DECRYPTED stamp animation, a light scatter of paper-dust particles
  falling from the top of the document, then the full plaintext quote types itself out
  letter-by-letter with the solve time and a "share result" CTA.
- **Synth SFX (WebAudio, generated in code, no audio files):**
  - *key strike* — short filtered noise burst, on every letter entry
  - *correct* — a clean short sine "blip" rising in pitch, on a correct substitution
  - *wrong* — a low, brief sawtooth buzz, on an incorrect substitution
  - *stamp thud* — a low sine/noise thump with a fast sub-bass decay, on solve
  - a mute toggle (speaker icon, top-right of the header) persists to `localStorage` and the
    `AudioContext` is created lazily on first user gesture.
- Respects `prefers-reduced-motion`: drops the shake, pulse-scatter, and stamp overshoot in
  favor of instant state changes, but keeps the sound and the stamp appearing (just without the
  slam animation).
