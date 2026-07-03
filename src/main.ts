import './style.css';
import { dailySeed, dayNumber } from './daily';
import { buildPuzzle } from './cipher';
import { quoteForDay } from './quotes';
import { rankByFrequency } from './frequency';

function mount(root: HTMLElement): void {
  const today = new Date();
  const day = dayNumber(today);
  const seed = dailySeed(today);
  const quote = quoteForDay(day);
  const puzzle = buildPuzzle(seed, quote);
  const frequencies = rankByFrequency(puzzle.ciphertext).slice(0, 6);

  root.innerHTML = `
    <main class="dossier">
      <header class="dossier__header">
        <h1 class="dossier__wordmark">Chrono Cipher</h1>
        <p class="dossier__tagline">Case No. ${day} — declassify today's quote</p>
      </header>
      <div class="dossier__body">
        <section class="dossier__document" aria-label="Encrypted quote">
          <p class="dossier__ciphertext">${puzzle.ciphertext}</p>
        </section>
        <aside class="dossier__evidence" aria-label="Letter frequency evidence">
          <h2>Frequency evidence</h2>
          <ul>
            ${frequencies
              .map((entry) => `<li>${entry.cipherLetter} — ${entry.count}×</li>`)
              .join('')}
          </ul>
        </aside>
      </div>
    </main>
  `;
}

const root = document.getElementById('app');
if (root) mount(root);
