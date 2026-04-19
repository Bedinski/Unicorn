/// <reference types="vite/client" />
import "./style.css";
import { WORDS } from "@/data/words";
import {
  MAX_LEVEL,
  isMaxLevel,
  levelForXp,
  xpIntoCurrentLevel,
  xpNeededForNextLevel,
} from "@/game/levels";
import { buildRound, type Round } from "@/game/rounds";
import {
  recordAnswer,
  resetKitty,
  type GameState,
} from "@/game/state";
import { clearState, loadState, saveState } from "@/game/storage";
import {
  choiceFromEvent,
  disableChoices,
  markChoice,
  renderBoard,
} from "@/ui/board";
import { cheerMessage, encourageMessage, flash } from "@/ui/feedback";
import { renderKitty } from "@/ui/kitty";
import { speakEn, speakZh } from "@/ui/speech";

const app = document.getElementById("app");
if (!app) throw new Error("#app root not found");

let state: GameState = loadState();
let round: Round = buildRound(WORDS, state.recentHanzi);
let locked = false;

render();

function render(): void {
  const level = levelForXp(state.xp);
  const levelXp = xpIntoCurrentLevel(state.xp);
  const nextXp = xpNeededForNextLevel(state.xp);
  const progressPct =
    nextXp === 0 ? 100 : Math.round((levelXp / nextXp) * 100);
  const max = isMaxLevel(state.xp);

  app!.innerHTML = `
    <header class="top-bar">
      <h1>Magical Kitty Mandarin</h1>
      <div class="level-chip" data-level>Level ${level} / ${MAX_LEVEL}</div>
    </header>

    <section class="kitty-stage" data-kitty-stage>
      ${renderKitty(level)}
      ${max ? `<div class="max-banner" data-max-banner>🌟 You made your kitty MAGICAL! 🌟</div>` : ""}
    </section>

    <section class="progress" aria-label="Level progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progressPct}%"></div>
      </div>
      <div class="progress-label">
        ${
          max
            ? "Max level reached!"
            : `${levelXp} / ${nextXp} to next level`
        }
      </div>
    </section>

    <section class="board" data-board>
      ${renderBoard(round)}
    </section>

    <section class="feedback" data-feedback aria-live="polite"></section>

    <footer class="bottom-bar">
      ${
        max
          ? `<button class="reset-btn" data-reset type="button">🐱 New Kitty</button>`
          : `<span class="score">✅ ${state.correctCount} &nbsp; 💭 ${state.incorrectCount}</span>`
      }
    </footer>
  `;

  const boardEl = app!.querySelector<HTMLElement>("[data-board]");
  boardEl?.addEventListener("click", onBoardClick);
  app!.querySelector<HTMLButtonElement>("[data-replay]")?.addEventListener(
    "click",
    () => speakZh(round.answer.hanzi),
  );
  app!.querySelector<HTMLButtonElement>("[data-reset]")?.addEventListener(
    "click",
    onReset,
  );

  // Speak the prompt after a tiny delay so voices are loaded on first paint.
  window.setTimeout(() => speakZh(round.answer.hanzi), 120);
}

function onBoardClick(event: Event): void {
  if (locked) return;
  const chosen = choiceFromEvent(event);
  if (!chosen) return;

  const wasCorrect = chosen === round.answer.english;
  const feedbackEl = app!.querySelector<HTMLElement>("[data-feedback]");
  const boardEl = app!.querySelector<HTMLElement>("[data-board]");
  if (!boardEl || !feedbackEl) return;

  locked = true;
  disableChoices(boardEl);

  if (wasCorrect) {
    markChoice(boardEl, chosen, "correct");
    feedbackEl.textContent = cheerMessage();
    feedbackEl.classList.add("feedback--correct");
    speakEn(round.answer.english);
    const stage = app!.querySelector<HTMLElement>("[data-kitty-stage]");
    if (stage) flash(stage, "kitty-stage--glow");
  } else {
    markChoice(boardEl, chosen, "incorrect");
    feedbackEl.textContent = encourageMessage();
    feedbackEl.classList.add("feedback--incorrect");
    window.setTimeout(
      () => markChoice(boardEl, round.answer.english, "reveal"),
      500,
    );
    flash(boardEl, "board--shake", 500);
  }

  const result = recordAnswer(state, round.answer.hanzi, wasCorrect);
  state = result.state;
  saveState(state);

  window.setTimeout(
    () => {
      round = buildRound(WORDS, state.recentHanzi);
      locked = false;
      render();
    },
    wasCorrect ? 850 : 1400,
  );
}

function onReset(): void {
  const ok = window.confirm("Start over with a brand new kitty?");
  if (!ok) return;
  state = resetKitty(state);
  clearState();
  saveState(state);
  round = buildRound(WORDS, state.recentHanzi);
  render();
}

