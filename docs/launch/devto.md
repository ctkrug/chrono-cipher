---
title: "Building Chrono Cipher: a daily codebreaking puzzle with no backend"
published: false
tags: typescript, webdev, gamedev, accessibility
---

I like the daily-puzzle habit, but almost every Wordle successor is the same loop with a new
coat of paint: guess a word, get colored tiles, repeat. I wanted one that asked for a different
skill, so I built [Chrono Cipher](https://apps.charliekrug.com/chrono-cipher/): each day a short
historical quote is hidden behind a substitution cipher, and you crack it the way a real
cryptanalyst would, by reasoning from letter frequency.

It is a static TypeScript site with no server, no database, and no accounts. Here are the build
decisions I found interesting.

## The date is the only shared state

Every player needs the same puzzle on the same day, but I did not want a backend to hand it out.
The trick is to derive everything from the calendar date. `dayNumber()` counts whole UTC days
since a fixed epoch, and that number seeds a small deterministic PRNG (`mulberry32`). The same
seed always produces the same shuffled substitution alphabet, so two people opening the page on
the same UTC day are solving the identical cipher without any coordination.

```ts
export function mulberry32(seed: number): () => number {
  let state = seed;
  return function random(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

That one function is why the whole game can ship as static assets on a subpath.

## Rerolling the cipher until it is a derangement

A random shuffle of the alphabet can leave a letter mapped to itself. In a substitution puzzle
that is a bug: it hands the player a free correct letter. So the shuffle is rerolled until it is
a derangement, a permutation where no element stays in its original position. It almost always
passes on the first or second try, and the puzzle never leaks a gift letter.

## The focus bug that taught me the most

The UI re-renders by rebuilding the container's `innerHTML` on every state change. Simple, but it
has a nasty side effect for keyboard and screen-reader users: replacing the DOM subtree drops
focus back to `<body>` every time you place a letter. Mid-solve, that is unusable.

The fix is to snapshot the focused control's identity before the rebuild, using its
`data-*` attribute rather than the element reference (the element is about to be destroyed), then
re-focus the equivalent control afterward:

```ts
const focusSelector = focusSelectorFor(document.activeElement, root);
root.innerHTML = renderEverything(state);
restoreFocus(root, focusSelector); // falls back to the hint button if it is now disabled
```

Writing tests around this was the part that made me appreciate how much of "accessibility" is
really just careful state management.

## Sound with zero audio files

Every sound effect (key strike, correct, wrong, the stamp thud on a win) is synthesized at
runtime with the Web Audio API from oscillators and a noise buffer. No `.mp3` assets, nothing to
download. The `AudioContext` is created lazily on the first interaction to respect autoplay
policy, and the player is a silent no-op when audio is unavailable, which also keeps it testable
under a mocked context in Node.

## What I would do differently

The full-`innerHTML` re-render is fine at this size, but it is the first thing I would replace if
the UI grew, since targeted DOM updates would remove the focus dance entirely. I would also
balance the quote set by ciphertext length, because a longer quote is a noticeably harder solve
and right now the difficulty wobbles day to day.

The code is on [GitHub](https://github.com/ctkrug/chrono-cipher) and the puzzle is live at
[apps.charliekrug.com/chrono-cipher](https://apps.charliekrug.com/chrono-cipher/). If you play
it, I would love to hear whether the frequency panel actually helped you or whether you ignored
it and solved by feel.
