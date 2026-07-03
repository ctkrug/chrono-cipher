import './style.css';
import { dailySeed, dayNumber } from './daily';
import { buildPuzzle, type CipherPuzzle } from './cipher';
import { quoteForDay } from './quotes';
import { rankByFrequency } from './frequency';
import { createGameState, type GameState } from './game';

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
}

const root = document.getElementById('app');
if (root) mount(root);
