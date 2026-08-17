import type { Word } from "@/data/words";
import type { McqRound } from "@/game/rounds";

export function renderBoard(round: McqRound): string {
  const buttons = round.choices
    .map(
      (choice, idx) => `
      <button class="choice"
              data-choice="${escapeAttr(choice.hanzi)}"
              data-index="${idx}"
              type="button">
        <span class="choice-label">${escapeHtml(choice.english)}</span>
      </button>`,
    )
    .join("");

  return `
    <section class="prompt-card" data-prompt>
      <button class="replay-audio" data-replay type="button" aria-label="Replay pronunciation">🔊</button>
      <div class="hanzi" data-hanzi>${escapeHtml(round.answer.hanzi)}</div>
      <div class="pinyin" data-pinyin>${escapeHtml(round.answer.pinyin)}</div>
    </section>
    <section class="choices" data-choices>
      ${buttons}
    </section>
  `;
}

export function markChoice(
  root: ParentNode,
  hanzi: string,
  state: "correct" | "incorrect" | "reveal",
): void {
  const btn = root.querySelector(
    `button.choice[data-choice="${cssEscape(hanzi)}"]`,
  );
  if (btn) btn.classList.add(`choice--${state}`);
}

export function disableChoices(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>("button.choice").forEach((btn) => {
    btn.disabled = true;
  });
}

export function choiceFromEvent(event: Event): Word["hanzi"] | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const btn = target.closest<HTMLButtonElement>("button.choice");
  return btn?.dataset.choice ?? null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function cssEscape(s: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(s);
  }
  return s.replace(/["\\]/g, "\\$&");
}
