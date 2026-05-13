import type { Word } from "@/data/words";

export interface TeacherCardHandlers {
  onListen: () => void;
  onNext: () => void;
  onRestart: () => void;
  onPrev: () => void;
}

/**
 * Render a flashcard for "Teacher Mode" — dictation practice where the
 * child writes on paper. Shows the character, pinyin, English meaning,
 * and a Listen button. Pressing Next advances the deck.
 *
 * When `index >= total` the function returns a "deck complete" card with
 * a Start Over button instead.
 */
export function renderTeacherCard(
  word: Word | null,
  index: number,
  total: number,
): string {
  if (total === 0) {
    return `
      <section class="teacher-card teacher-card--empty">
        <div class="teacher-card-emoji">📭</div>
        <div class="teacher-card-message">No dictation words available for this selection.</div>
        <div class="teacher-card-hint">Pick a different week above, or switch back to game mode.</div>
      </section>
    `;
  }
  if (index >= total || !word) {
    return `
      <section class="teacher-card teacher-card--complete">
        <div class="teacher-card-emoji">🎉</div>
        <div class="teacher-card-message">All done!</div>
        <div class="teacher-card-hint">Great writing practice today.</div>
        <button class="teacher-btn teacher-btn--restart" data-teacher-restart type="button">
          🔄 Start Over
        </button>
      </section>
    `;
  }

  const hanzi = escapeHtml(word.hanzi);
  const pinyin = escapeHtml(word.pinyin);
  const english = escapeHtml(word.english);
  const isLast = index + 1 === total;

  return `
    <div class="teacher-progress">
      <div class="teacher-progress-text">Card ${index + 1} of ${total}</div>
      <div class="teacher-progress-bar">
        <div class="teacher-progress-fill" style="width:${Math.round(((index + 1) / total) * 100)}%"></div>
      </div>
    </div>
    <section class="teacher-card" data-teacher-card>
      <div class="teacher-card-emoji">👨‍🏫</div>
      <div class="teacher-hanzi" data-teacher-hanzi>${hanzi}</div>
      <div class="teacher-pinyin">${pinyin}</div>
      <div class="teacher-english">${english}</div>
      <div class="teacher-instruction">Write it on paper, then tap Next.</div>
      <div class="teacher-actions">
        <button class="teacher-btn teacher-btn--listen" data-teacher-listen type="button">
          🔊 Listen
        </button>
        <button class="teacher-btn teacher-btn--next" data-teacher-next type="button">
          ${isLast ? "🎉 Finish" : "Next ➡️"}
        </button>
      </div>
      ${
        index > 0
          ? `<button class="teacher-btn teacher-btn--prev" data-teacher-prev type="button">⬅️ Previous</button>`
          : ""
      }
    </section>
  `;
}

export function wireTeacherCard(
  root: HTMLElement,
  handlers: TeacherCardHandlers,
): () => void {
  const disposers: Array<() => void> = [];

  const listen = root.querySelector<HTMLButtonElement>("[data-teacher-listen]");
  if (listen) {
    listen.addEventListener("click", handlers.onListen);
    disposers.push(() => listen.removeEventListener("click", handlers.onListen));
  }

  const next = root.querySelector<HTMLButtonElement>("[data-teacher-next]");
  if (next) {
    next.addEventListener("click", handlers.onNext);
    disposers.push(() => next.removeEventListener("click", handlers.onNext));
  }

  const prev = root.querySelector<HTMLButtonElement>("[data-teacher-prev]");
  if (prev) {
    prev.addEventListener("click", handlers.onPrev);
    disposers.push(() => prev.removeEventListener("click", handlers.onPrev));
  }

  const restart = root.querySelector<HTMLButtonElement>(
    "[data-teacher-restart]",
  );
  if (restart) {
    restart.addEventListener("click", handlers.onRestart);
    disposers.push(() =>
      restart.removeEventListener("click", handlers.onRestart),
    );
  }

  return () => disposers.forEach((fn) => fn());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
