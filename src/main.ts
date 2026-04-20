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
import {
  buildRound,
  pickRoundType,
  type Round,
} from "@/game/rounds";
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
import { renderDrawBoard, wireDrawBoard } from "@/ui/drawBoard";
import { cheerMessage, encourageMessage, flash } from "@/ui/feedback";
import { renderKitty } from "@/ui/kitty";
import { canSpeak, speakEn, speakZh } from "@/ui/speech";

const app = document.getElementById("app");
if (!app) throw new Error("#app root not found");

let state: GameState = loadState();
let round: Round = nextRound();
let locked = false;
let disposeBoard: (() => void) | null = null;

render();

function nextRound(): Round {
  const kind = pickRoundType(Math.random, canSpeak());
  return buildRound(WORDS, state.recentHanzi, Math.random, kind);
}

function render(): void {
  disposeBoard?.();
  disposeBoard = null;

  const level = levelForXp(state.xp);
  const levelXp = xpIntoCurrentLevel(state.xp);
  const nextXp = xpNeededForNextLevel(state.xp);
  const progressPct =
    nextXp === 0 ? 100 : Math.round((levelXp / nextXp) * 100);
  const max = isMaxLevel(state.xp);

  const boardHtml =
    round.kind === "mcq" ? renderBoard(round) : renderDrawBoard(round);

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
        ${max ? "Max level reached!" : `${levelXp} / ${nextXp} to next level`}
      </div>
    </section>

    <section class="board board--${round.kind}" data-board>
      ${boardHtml}
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

  const boardEl = app!.querySelector<HTMLElement>("[data-board]")!;

  if (round.kind === "mcq") {
    boardEl.addEventListener("click", onMcqClick);
    boardEl
      .querySelector<HTMLButtonElement>("[data-replay]")
      ?.addEventListener("click", () => speakZh(round.answer.hanzi));
    disposeBoard = () => boardEl.removeEventListener("click", onMcqClick);
  } else {
    disposeBoard = wireDrawBoard(boardEl, {
      onReveal: () => speakZh(round.answer.hanzi),
      onReplayAudio: () => speakZh(round.answer.hanzi),
      onGotIt: () => onDrawComplete(true),
      onNeedsPractice: () => onDrawComplete(false),
    });
  }

  app!
    .querySelector<HTMLButtonElement>("[data-reset]")
    ?.addEventListener("click", onReset);

  // Speak the prompt after a tiny delay so voices are loaded on first paint.
  window.setTimeout(() => speakZh(round.answer.hanzi), 120);
}

function onMcqClick(event: Event): void {
  if (locked || round.kind !== "mcq") return;
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

  commitAnswer(wasCorrect, wasCorrect ? 850 : 1400);
}

function onDrawComplete(wasCorrect: boolean): void {
  if (locked) return;
  locked = true;

  const feedbackEl = app!.querySelector<HTMLElement>("[data-feedback]");
  const stage = app!.querySelector<HTMLElement>("[data-kitty-stage]");
  if (feedbackEl) {
    feedbackEl.textContent = wasCorrect ? cheerMessage() : encourageMessage();
    feedbackEl.classList.add(
      wasCorrect ? "feedback--correct" : "feedback--incorrect",
    );
  }
  if (wasCorrect) {
    speakEn(round.answer.english);
    if (stage) flash(stage, "kitty-stage--glow");
  }

  commitAnswer(wasCorrect, wasCorrect ? 900 : 1200);
}

function commitAnswer(wasCorrect: boolean, advanceMs: number): void {
  const result = recordAnswer(state, round.answer.hanzi, wasCorrect);
  state = result.state;
  saveState(state);

  window.setTimeout(() => {
    round = nextRound();
    locked = false;
    render();
  }, advanceMs);
}

function onReset(): void {
  const ok = window.confirm("Start over with a brand new kitty?");
  if (!ok) return;
  state = resetKitty(state);
  clearState();
  saveState(state);
  round = nextRound();
  render();
}
