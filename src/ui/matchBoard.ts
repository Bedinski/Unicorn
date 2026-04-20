import type { MatchRound } from "@/game/rounds";

export function renderMatchBoard(round: MatchRound): string {
  const buttons = round.choices
    .map(
      (choice, idx) => `
      <button class="choice choice--hanzi"
              data-choice="${escapeAttr(choice.hanzi)}"
              data-english="${escapeAttr(choice.english)}"
              data-index="${idx}"
              type="button">
        <span class="choice-hanzi">${escapeHtml(choice.hanzi)}</span>
      </button>`,
    )
    .join("");

  return `
    <section class="prompt-card prompt-card--match" data-prompt>
      <button class="replay-audio replay-audio--large" data-replay type="button" aria-label="Play pronunciation">
        <span class="replay-icon">🔊</span>
        <span class="replay-label">Listen</span>
      </button>
      <div class="draw-instruction">Which character did you hear?</div>
    </section>
    <section class="choices choices--hanzi" data-choices>
      ${buttons}
    </section>
  `;
}

export function markMatchChoice(
  root: ParentNode,
  hanzi: string,
  state: "correct" | "incorrect" | "reveal",
): void {
  const btn = root.querySelector(
    `button.choice[data-choice="${cssEscape(hanzi)}"]`,
  );
  if (btn) btn.classList.add(`choice--${state}`);
}

export function disableMatchChoices(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>("button.choice").forEach((btn) => {
    btn.disabled = true;
  });
}

export function matchChoiceFromEvent(event: Event): string | null {
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
