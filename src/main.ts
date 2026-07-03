import './style.css';
import { dailySeed, dayNumber } from './daily';
import { buildPuzzle, type CipherPuzzle } from './cipher';
import { quoteForDay } from './quotes';
import { rankByFrequency } from './frequency';
import { applyGuess, createGameState, type GameState } from './game';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface AppState {
  puzzle: CipherPuzzle;
  day: number;
  game: GameState;
  selectedCipherLetter: string | null;
}

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

      const label = guessed ? `Cipher letter ${char}, guessed ${guessed}` : `Cipher letter ${char}, unsolved`;
      return `<button
        type="button"
        class="${classes.join(' ')}"
        data-cipher-letter="${char}"
        data-index="${index}"
        aria-label="${label}"
        aria-pressed="${char === state.selectedCipherLetter}"
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
      const solved = Boolean(guessed);
      return `<li class="evidence__item${solved ? ' evidence__item--solved' : ''}">
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
      return `<button
        type="button"
        class="${classes.join(' ')}"
        data-plain-letter="${letter}"
        aria-label="Guess plaintext letter ${letter}"
      >${letter}</button>`;
    })
    .join('');
}

function render(root: HTMLElement, state: AppState): void {
  root.innerHTML = `
    <main class="dossier">
      <header class="dossier__header">
        <h1 class="dossier__wordmark">Chrono Cipher</h1>
        <p class="dossier__tagline">Case No. ${state.day} — declassify today's quote</p>
      </header>
      <div class="dossier__body">
        <section class="dossier__document" aria-label="Encrypted quote">
          <p class="dossier__ciphertext">${renderDocument(state)}</p>
        </section>
        <aside class="dossier__evidence" aria-label="Letter frequency evidence">
          <h2>Frequency evidence</h2>
          <ul class="evidence__list">
            ${renderEvidence(state)}
          </ul>
        </aside>
      </div>
      <div class="keyboard" role="group" aria-label="Substitution keyboard">
        ${renderKeyboard(state)}
      </div>
    </main>
  `;

  root.querySelectorAll<HTMLButtonElement>('[data-cipher-letter]').forEach((button) => {
    button.addEventListener('click', () => {
      const letter = button.dataset.cipherLetter;
      if (!letter) return;
      state.selectedCipherLetter = state.selectedCipherLetter === letter ? null : letter;
      render(root, state);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-plain-letter]').forEach((button) => {
    button.addEventListener('click', () => {
      guess(root, state, button.dataset.plainLetter);
    });
  });
}

function guess(root: HTMLElement, state: AppState, plainLetter: string | undefined): void {
  if (!plainLetter || !state.selectedCipherLetter) return;

  const outcome = applyGuess(state.game, state.selectedCipherLetter, plainLetter);
  state.game = outcome.state;
  if (outcome.correct) state.selectedCipherLetter = null;

  render(root, state);
}

function mount(root: HTMLElement): void {
  const today = new Date();
  const day = dayNumber(today);
  const seed = dailySeed(today);
  const quote = quoteForDay(day);
  const puzzle = buildPuzzle(seed, quote);

  const state: AppState = {
    puzzle,
    day,
    game: createGameState(puzzle),
    selectedCipherLetter: null,
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
