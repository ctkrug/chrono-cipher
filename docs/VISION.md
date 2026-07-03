# Vision

## The problem

The daily-puzzle genre exploded after Wordle, but almost every entrant is the same loop with a
new coat of paint: guess a word, get colored tiles, repeat. None of them ask the player to
actually *think like a cryptanalyst* — to notice that a symbol repeats often and infer it's
probably "E," or that a lone two-letter cipher-word is almost certainly "IT" or "IS." That's a
genuinely different, teachable skill, and it's been sitting unused as a puzzle mechanic.

## Who it's for

People who already have a daily-puzzle habit (Wordle, Connections, Spelling Bee) and want
something that rewards a different kind of reasoning — pattern recognition and statistical
inference rather than vocabulary recall. Secondary audience: anyone who enjoys trivia/history
and gets a small payoff from *whose* quote they just decrypted.

## The core idea

Each day, a short historical quote is enciphered with a monoalphabetic substitution cipher,
seeded deterministically from the calendar date so every player worldwide gets the identical
puzzle. The player solves it by proposing a mapping from cipher letters to plaintext letters;
every guess updates every matching cell in the document at once (classic substitution-cipher
solving, not letter-by-letter Wordle guessing). A frequency-analysis engine — the ciphertext's
own letter distribution, not a scripted hint list — can be asked for the single most useful next
reveal at any time, at the cost of counting against the share grid.

## Key design decisions

- **Deterministic, serverless daily puzzles.** The date is the only shared state; no accounts,
  no backend, no database. `dayNumber()` + a seeded PRNG (`mulberry32`) reproduce the exact same
  substitution map for everyone on a given UTC day. This keeps the whole game a static site.
- **The hint engine is real cryptanalysis, not flavor text.** `rankByFrequency` / `nextHint`
  reveal the highest observed-frequency unsolved cipher letter — the same first move a human
  would make with pencil and paper, since English text is dominated by a handful of letters
  (E, T, A). This is the project's actual point of craft, not a side feature.
- **A derangement constraint on the cipher.** The substitution map is rerolled until no letter
  maps to itself, so the puzzle never accidentally hands out a free correct letter.
- **Spoiler-free sharing.** The emoji-grid result (`buildEmojiGrid`) encodes only solve time and
  which letters were deduced vs. hinted — never the quote or plaintext — so results are safe to
  post publicly before others have solved that day's puzzle.
- **Presentation matches the mechanic.** The "declassified dossier" visual direction
  (`docs/DESIGN.md`) turns solving into "declassifying a file," rather than dressing classical
  cryptanalysis in a generic dark-mode puzzle-app shell.

## What "v1 done" looks like

- A player can open the site on desktop or phone, see today's enciphered quote and a live
  frequency-evidence panel, and solve it entirely through a substitution keyboard (typing/
  clicking a cipher letter maps it to a chosen plaintext letter everywhere at once).
- Wrong and correct guesses get immediate, juiced feedback (shake/pulse, synth SFX); solving
  triggers the DECRYPTED stamp win celebration with the quote, its author, solve time, and a
  "copy result" button that produces the emoji grid.
- A hint button reveals the next most useful letter via the frequency engine and is tracked in
  the share result.
- The puzzle is genuinely different every day (deterministic per UTC date) and the whole thing
  ships as static files with no server, matching `apps.charliekrug.com/chrono-cipher` hosting.
