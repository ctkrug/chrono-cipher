import './style.css';
import { dailySeed, dayNumber } from './daily';
import { buildPuzzle, type CipherPuzzle } from './cipher';
import { quoteForDay } from './quotes';
import { rankByFrequency } from './frequency';
import { applyGuess, applyHint, createGameState, isSolved, toSolveResult, type GameState } from './game';
import { createMuteState, type MuteState } from './mute';
import { createSfxPlayer, type SfxPlayer } from './audio';
import { buildEmojiGrid, formatSolveTime } from './share';
import { loadProgress, saveProgress } from './persistence';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface LastAction {
  cipherLetter: string;
  type: 'correct' | 'wrong';
}

interface AppState {
  puzzle: CipherPuzzle;
  day: number;
  game: GameState;
  selectedCipherLetter: string | null;
  lastAction: LastAction | null;
  sfx: SfxPlayer;
  mute: MuteState;
  startedAtMs: number;
  solved: boolean;
  solveTimeMs: number | null;
  announcement: string;
}

const FEEDBACK_DURATION_MS = 200;

function renderDocument(state: AppState): string {
  return state.puzzle.ciphertext
    .split('')
    .map((char, index) => {
      if (!/[A-Z]/.test(char)) {
        return `<span class="dossier__cell dossier__cell--static" aria-hidden="true">${char}</span>`;
      }

      const guessed = state.game.mapping[char];
      const reveal = state.game.reveals.find((r) => r.cipherLetter === char);
      const classes = ['dossier__cell'];
      if (guessed) classes.push('dossier__cell--solved');
      if (reveal?.hinted) classes.push('dossier__cell--hinted');
      if (char === state.selectedCipherLetter) classes.push('dossier__cell--selected');
      if (state.lastAction?.cipherLetter === char) {
        classes.push(state.lastAction.type === 'correct' ? 'dossier__cell--pulse' : 'dossier__cell--shake');
      }

      const label = guessed ? `Cipher letter ${char}, guessed ${guessed}` : `Cipher letter ${char}, unsolved`;
      return `<button
        type="button"
        class="${classes.join(' ')}"
        data-cipher-letter="${char}"
        data-index="${index}"
        aria-label="${label}"
        aria-pressed="${char === state.selectedCipherLetter}"
        aria-disabled="${Boolean(guessed)}"
      >
        <span class="dossier__cell-plain">${guessed ?? ''}</span>
        <span class="dossier__cell-cipher">${char}</span>
      </button>`;
    })
    .join('');
}

function renderEvidence(state: AppState): string {
  const frequencies = rankByFrequency(state.puzzle.ciphertext);
  return frequencies
    .map((entry) => {
      const guessed = state.game.mapping[entry.cipherLetter];
      const reveal = state.game.reveals.find((r) => r.cipherLetter === entry.cipherLetter);
      const classes = ['evidence__item'];
      if (guessed) classes.push('evidence__item--solved');
      if (reveal?.hinted) classes.push('evidence__item--hinted');
      return `<li class="${classes.join(' ')}">
        <span class="evidence__rank">${entry.rank}</span>
        <span class="evidence__letter">${entry.cipherLetter}</span>
        <span class="evidence__count">${entry.count}×</span>
        <span class="evidence__guess">${guessed ?? ''}</span>
      </li>`;
    })
    .join('');
}

function renderKeyboard(state: AppState): string {
  return ALPHABET.split('')
    .map((letter) => {
      const used = Object.values(state.game.mapping).includes(letter);
      const classes = ['keyboard__key'];
      if (used) classes.push('keyboard__key--used');
      const label = used ? `Plaintext letter ${letter}, already assigned` : `Guess plaintext letter ${letter}`;
      return `<button
        type="button"
        class="${classes.join(' ')}"
        data-plain-letter="${letter}"
        aria-label="${label}"
        ${used ? 'disabled' : ''}
      >${letter}</button>`;
    })
    .join('');
}

const DUST_PARTICLE_COUNT = 18;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function renderDustField(): string {
  if (prefersReducedMotion()) return '';

  const particles = Array.from({ length: DUST_PARTICLE_COUNT }, () => {
    const left = Math.round(Math.random() * 100);
    const delay = Math.round(Math.random() * 500);
    const duration = 900 + Math.round(Math.random() * 500);
    return `<span class="win__dust" style="left: ${left}%; animation-delay: ${delay}ms; animation-duration: ${duration}ms;"></span>`;
  }).join('');

  return `<div class="win__dust-field" aria-hidden="true">${particles}</div>`;
}

function renderWinOverlay(state: AppState): string {
  if (!state.solved || state.solveTimeMs === null) return '';

  const words = state.puzzle.plaintext.split(' ');
  const typedQuote = words
    .map(
      (word, wordIndex) =>
        `<span class="win__word">${word
          .split('')
          .map(
            (letter, letterIndex) =>
              `<span class="win__letter" style="animation-delay: ${(wordIndex * 6 + letterIndex) * 35}ms">${letter}</span>`,
          )
          .join('')}</span>`,
    )
    .join(' ');

  return `
    <div class="win" role="dialog" aria-label="Puzzle solved">
      <div class="win__card" tabindex="-1">
        ${renderDustField()}
        <div class="win__stamp" aria-hidden="true">DECRYPTED</div>
        <p class="win__quote">${typedQuote}</p>
        <p class="win__author">— ${state.puzzle.author}</p>
        <dl class="win__stats">
          <div class="win__stat">
            <dt>Solve time</dt>
            <dd>${formatSolveTime(state.solveTimeMs)}</dd>
          </div>
          <div class="win__stat">
            <dt>Hints used</dt>
            <dd>${state.game.hintsUsed}</dd>
          </div>
        </dl>
        <button type="button" class="win__copy" data-action="copy-result">Copy result</button>
        <p class="win__toast" role="status" aria-live="polite"></p>
      </div>
    </div>
  `;
}

/** Identifies the currently focused control by its data-attribute, if it's inside root. */
function focusSelectorFor(active: Element | null, root: HTMLElement): string | null {
  if (!(active instanceof HTMLElement) || !root.contains(active)) return null;
  if (active.dataset.cipherLetter) return `[data-cipher-letter="${active.dataset.cipherLetter}"]`;
  if (active.dataset.plainLetter) return `[data-plain-letter="${active.dataset.plainLetter}"]`;
  if (active.dataset.action) return `[data-action="${active.dataset.action}"]`;
  return null;
}

/** Re-focuses the equivalent control after a re-render, falling back to the hint button. */
function restoreFocus(root: HTMLElement, selector: string | null): void {
  if (!selector) return;
  const target = root.querySelector<HTMLElement>(selector);
  if (target && !target.hasAttribute('disabled')) {
    target.focus();
  } else {
    root.querySelector<HTMLElement>('[data-action="hint"]')?.focus();
  }
}

function render(root: HTMLElement, state: AppState): void {
  const focusSelector = focusSelectorFor(document.activeElement, root);

  root.innerHTML = `
    <main class="dossier">
      <header class="dossier__header">
        <div>
          <h1 class="dossier__wordmark">Chrono Cipher</h1>
          <p class="dossier__tagline">Case No. ${state.day} — declassify today's quote</p>
        </div>
        <button
          type="button"
          class="dossier__mute"
          data-action="toggle-mute"
          aria-pressed="${state.mute.isMuted()}"
          aria-label="${state.mute.isMuted() ? 'Unmute sound' : 'Mute sound'}"
        >${state.mute.isMuted() ? '🔇' : '🔊'}</button>
      </header>
      <p class="sr-only" role="status" aria-live="polite">${state.announcement}</p>
      <div class="dossier__body">
        <section class="dossier__document" aria-label="Encrypted quote">
          <div class="dossier__letterhead">
            <span>Transcript — substitution cipher</span>
            <span>${state.solved ? 'Status: declassified' : 'Status: in progress'}</span>
          </div>
          <p class="dossier__ciphertext">${renderDocument(state)}</p>
          <div class="dossier__redacted" aria-hidden="true">
            <span class="dossier__redacted-line" style="width: 82%"></span>
            <span class="dossier__redacted-line" style="width: 64%"></span>
            <span class="dossier__redacted-line" style="width: 91%"></span>
            <span class="dossier__redacted-line" style="width: 45%"></span>
          </div>
        </section>
        <aside class="dossier__evidence" aria-label="Letter frequency evidence">
          <h2>Frequency evidence</h2>
          <ul class="evidence__list">
            ${renderEvidence(state)}
          </ul>
          <button
            type="button"
            class="evidence__hint"
            data-action="hint"
            ${isSolved(state.game) ? 'disabled' : ''}
          >Request hint (${state.game.hintsUsed} used)</button>
        </aside>
      </div>
      <div class="keyboard" role="group" aria-label="Substitution keyboard">
        ${renderKeyboard(state)}
      </div>
      ${renderWinOverlay(state)}
    </main>
  `;

  root.querySelectorAll<HTMLButtonElement>('[data-cipher-letter]').forEach((button) => {
    button.addEventListener('click', () => {
      const letter = button.dataset.cipherLetter;
      if (!letter || letter in state.game.mapping) return;
      state.selectedCipherLetter = state.selectedCipherLetter === letter ? null : letter;
      state.sfx.playKeyStrike();
      render(root, state);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-plain-letter]').forEach((button) => {
    button.addEventListener('click', () => {
      guess(root, state, button.dataset.plainLetter);
    });
  });

  root.querySelector<HTMLButtonElement>('[data-action="hint"]')?.addEventListener('click', () => {
    requestHint(root, state);
  });

  root.querySelector<HTMLButtonElement>('[data-action="copy-result"]')?.addEventListener('click', () => {
    copyResult(root, state);
  });

  root.querySelector<HTMLButtonElement>('[data-action="toggle-mute"]')?.addEventListener('click', () => {
    state.mute.toggle();
    render(root, state);
  });

  restoreFocus(root, focusSelector);
}

/** Copies the spoiler-free emoji-grid share result and shows a brief confirmation. */
function copyResult(root: HTMLElement, state: AppState): void {
  if (state.solveTimeMs === null) return;

  const grid = buildEmojiGrid(toSolveResult(state.game, state.day, state.solveTimeMs));
  const toast = root.querySelector<HTMLElement>('.win__toast');

  if (!navigator.clipboard) {
    if (toast) toast.textContent = 'Clipboard unavailable — select and copy the result manually.';
    return;
  }

  navigator.clipboard
    .writeText(grid)
    .then(() => {
      if (toast) toast.textContent = 'Copied to clipboard!';
    })
    .catch(() => {
      if (toast) toast.textContent = 'Could not copy — select and copy the result manually.';
    });
}

function flashLastAction(root: HTMLElement, state: AppState, cipherLetter: string): void {
  window.setTimeout(() => {
    if (state.lastAction?.cipherLetter === cipherLetter) {
      state.lastAction = null;
      render(root, state);
    }
  }, FEEDBACK_DURATION_MS);
}

/** Persists the current game/win state so a reload resumes instead of restarting. */
function persist(state: AppState): void {
  saveProgress(window.localStorage, state.day, {
    mapping: state.game.mapping,
    reveals: state.game.reveals,
    hintsUsed: state.game.hintsUsed,
    startedAtMs: state.startedAtMs,
    solved: state.solved,
    solveTimeMs: state.solveTimeMs,
  });
}

/** Checks for the solved state after a guess/hint and triggers the win celebration once. */
function checkWin(state: AppState): void {
  if (state.solved || !isSolved(state.game)) return;
  state.solved = true;
  state.solveTimeMs = Date.now() - state.startedAtMs;
  state.sfx.playStampThud();
  state.announcement = `${state.announcement} Case declassified in ${formatSolveTime(state.solveTimeMs)}.`;
}

function guess(root: HTMLElement, state: AppState, plainLetter: string | undefined): void {
  if (!plainLetter || !state.selectedCipherLetter || state.solved) return;
  if (Object.values(state.game.mapping).includes(plainLetter)) return;

  const cipherLetter = state.selectedCipherLetter;
  const outcome = applyGuess(state.game, cipherLetter, plainLetter);
  state.game = outcome.state;
  state.lastAction = { cipherLetter, type: outcome.correct ? 'correct' : 'wrong' };
  if (outcome.correct) {
    state.selectedCipherLetter = null;
    state.sfx.playCorrect();
    state.announcement = `Correct: ${cipherLetter} is ${plainLetter}.`;
    checkWin(state);
  } else {
    state.sfx.playWrong();
    state.announcement = `Incorrect guess for ${cipherLetter}.`;
  }

  persist(state);
  render(root, state);
  focusWinCardIfSolved(root, state);
  flashLastAction(root, state, cipherLetter);
}

function requestHint(root: HTMLElement, state: AppState): void {
  if (state.solved) return;
  const { state: nextGame, hint } = applyHint(state.game);
  if (!hint) return;

  state.game = nextGame;
  state.lastAction = { cipherLetter: hint.cipherLetter, type: 'correct' };
  state.sfx.playCorrect();
  state.announcement = `Hint revealed: ${hint.cipherLetter} is ${state.game.mapping[hint.cipherLetter]}.`;
  checkWin(state);

  persist(state);
  render(root, state);
  focusWinCardIfSolved(root, state);
  flashLastAction(root, state, hint.cipherLetter);
}

/** Moves focus into the win card the moment it first appears, for keyboard/screen-reader users. */
function focusWinCardIfSolved(root: HTMLElement, state: AppState): void {
  if (!state.solved) return;
  root.querySelector<HTMLElement>('.win__card')?.focus();
}

function mount(root: HTMLElement): void {
  const today = new Date();
  const day = dayNumber(today);
  const seed = dailySeed(today);
  const quote = quoteForDay(day);
  const puzzle = buildPuzzle(seed, quote);
  const mute = createMuteState(window.localStorage);
  const stored = loadProgress(window.localStorage, day);

  const state: AppState = {
    puzzle,
    day,
    game: stored
      ? { puzzle, mapping: stored.mapping, reveals: stored.reveals, hintsUsed: stored.hintsUsed }
      : createGameState(puzzle),
    selectedCipherLetter: null,
    lastAction: null,
    sfx: createSfxPlayer(mute),
    mute,
    startedAtMs: stored?.startedAtMs ?? Date.now(),
    solved: stored?.solved ?? false,
    solveTimeMs: stored?.solveTimeMs ?? null,
    announcement: '',
  };

  render(root, state);

  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const letter = event.key.toUpperCase();
    if (!ALPHABET.includes(letter) || letter.length !== 1) return;
    guess(root, state, letter);
  });
}

const root = document.getElementById('app');
if (root) mount(root);
