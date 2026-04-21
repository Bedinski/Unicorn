/// <reference types="vite/client" />
import "./style.css";
import {
  currentWeekSummary,
  drawPool,
  recognitionPool,
} from "@/game/curriculum";
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
  DAILY_STAR_GOAL,
  type AnswerResult,
  type GameState,
  recordAnswer,
  resetKitty,
} from "@/game/state";
import { clearState, loadState, saveState } from "@/game/storage";
import {
  choiceFromEvent,
  disableChoices,
  markChoice,
  renderBoard,
} from "@/ui/board";
import { burst } from "@/ui/confetti";
import { renderDrawBoard, wireDrawBoard } from "@/ui/drawBoard";
import { cheerMessage, encourageMessage, flash } from "@/ui/feedback";
import { renderBabyKitty, renderKitty } from "@/ui/kitty";
import {
  disableMatchChoices,
  markMatchChoice,
  matchChoiceFromEvent,
  renderMatchBoard,
} from "@/ui/matchBoard";
import { canSpeak, speakEn, speakZh } from "@/ui/speech";
import {
  STICKERS,
  infoFor,
  renderStickerBook,
  stickerSummary,
} from "@/ui/stickers";

const app = document.getElementById("app");
if (!app) throw new Error("#app root not found");

let state: GameState = loadState();
let round: Round = nextRound();
let isNewWord = !state.seenHanzi.includes(round.answer.hanzi);
let locked = false;
let disposeBoard: (() => void) | null = null;
let stickerBookOpen = false;

render();

function nextRound(): Round {
  const kind = pickRoundType(Math.random, canSpeak());
  const pool = kind === "draw" ? drawPool() : recognitionPool();
  // Pool must have at least 3 entries so MCQ/Match can build distractors.
  // drawPool may dip below 3 very early in the school year; upgrade to the
  // recognition pool in that case.
  const safePool = pool.length >= 3 ? pool : recognitionPool();
  return buildRound(safePool, state.recentHanzi, Math.random, kind);
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

  const boardHtml = renderRoundBoard(round);
  const { earnedCount, total } = stickerSummary(state.categoryCorrect);
  const starsPct = Math.min(
    100,
    Math.round((state.stars.count / DAILY_STAR_GOAL) * 100),
  );

  app!.innerHTML = `
    <header class="top-bar">
      <h1>Magical Kitty Mandarin</h1>
      <div class="top-chips">
        ${
          state.streak > 0
            ? `<div class="streak-chip" data-streak>🔥 ${state.streak}</div>`
            : ""
        }
        <div class="level-chip" data-level>Level ${level} / ${MAX_LEVEL}</div>
      </div>
    </header>
    ${
      currentWeekSummary()
        ? `<div class="week-banner" data-week>📖 ${currentWeekSummary()}</div>`
        : ""
    }

    <section class="kitty-stage" data-kitty-stage>
      <div class="kitty-main">
        ${renderKitty(level)}
      </div>
      <div class="kitty-babies" data-babies>
        ${renderBabyKitty(level, 0)}
        ${renderBabyKitty(level, 1)}
        ${renderBabyKitty(level, 2)}
      </div>
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

    <section class="daily-goal" aria-label="Daily star goal">
      <div class="daily-goal-label">
        ⭐ Today: ${Math.min(state.stars.count, DAILY_STAR_GOAL)} / ${DAILY_STAR_GOAL}
        ${state.stars.count >= DAILY_STAR_GOAL ? " 🎉" : ""}
      </div>
      <div class="daily-goal-bar">
        <div class="daily-goal-fill" style="width:${starsPct}%"></div>
      </div>
    </section>

    <section class="board board--${round.kind}" data-board>
      ${
        isNewWord
          ? `<div class="new-badge" data-new-badge>✨ NEW WORD!</div>`
          : ""
      }
      ${boardHtml}
    </section>

    <section class="feedback" data-feedback aria-live="polite"></section>

    <footer class="bottom-bar">
      <button class="sticker-btn" data-open-stickers type="button" aria-label="Open sticker book">
        🏅 <span class="sticker-count">${earnedCount}/${total}</span>
      </button>
      ${
        max
          ? `<button class="reset-btn" data-reset type="button">🐱 New Kitty</button>`
          : `<span class="score">✅ ${state.correctCount} &nbsp; 💭 ${state.incorrectCount}</span>`
      }
    </footer>
    ${stickerBookOpen ? renderStickerBook(state.categoryCorrect, earnedCategoriesList()) : ""}
  `;

  wireBoard();
  wireFooter();
  if (stickerBookOpen) wireStickerBook();

  // Speak the prompt after a tiny delay so voices are loaded on first paint.
  window.setTimeout(() => speakZh(round.answer.hanzi), 120);
}

function earnedCategoriesList() {
  return STICKERS.map((s) => s.category).filter(
    (c) => (state.categoryCorrect[c] ?? 0) >= 5,
  );
}

function renderRoundBoard(r: Round): string {
  if (r.kind === "mcq") return renderBoard(r);
  if (r.kind === "draw") return renderDrawBoard(r);
  return renderMatchBoard(r);
}

function wireBoard(): void {
  const boardEl = app!.querySelector<HTMLElement>("[data-board]")!;
  if (round.kind === "mcq") {
    boardEl.addEventListener("click", onMcqClick);
    boardEl
      .querySelector<HTMLButtonElement>("[data-replay]")
      ?.addEventListener("click", () => speakZh(round.answer.hanzi));
    disposeBoard = () => boardEl.removeEventListener("click", onMcqClick);
  } else if (round.kind === "match") {
    boardEl.addEventListener("click", onMatchClick);
    boardEl
      .querySelector<HTMLButtonElement>("[data-replay]")
      ?.addEventListener("click", () => speakZh(round.answer.hanzi));
    disposeBoard = () => boardEl.removeEventListener("click", onMatchClick);
  } else {
    disposeBoard = wireDrawBoard(boardEl, {
      onReplayAudio: () => speakZh(round.answer.hanzi),
      onDone: () => onDrawComplete(),
    });
  }
}

function wireFooter(): void {
  app!
    .querySelector<HTMLButtonElement>("[data-reset]")
    ?.addEventListener("click", onReset);
  app!
    .querySelector<HTMLButtonElement>("[data-open-stickers]")
    ?.addEventListener("click", () => {
      stickerBookOpen = true;
      render();
    });
}

function wireStickerBook(): void {
  const book = app!.querySelector<HTMLElement>("[data-sticker-book]");
  if (!book) return;
  const close = () => {
    stickerBookOpen = false;
    render();
  };
  book
    .querySelector<HTMLButtonElement>("[data-close]")
    ?.addEventListener("click", close);
  book.addEventListener("click", (e) => {
    if (e.target === book) close();
  });
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
    showFeedback(feedbackEl, cheerMessage(), "correct");
    speakEn(round.answer.english);
  } else {
    markChoice(boardEl, chosen, "incorrect");
    showFeedback(feedbackEl, encourageMessage(), "incorrect");
    window.setTimeout(
      () => markChoice(boardEl, round.answer.english, "reveal"),
      500,
    );
    flash(boardEl, "board--shake", 500);
  }

  commitAnswer(wasCorrect, wasCorrect ? 900 : 1400);
}

function onMatchClick(event: Event): void {
  if (locked || round.kind !== "match") return;
  const chosen = matchChoiceFromEvent(event);
  if (!chosen) return;

  const wasCorrect = chosen === round.answer.hanzi;
  const feedbackEl = app!.querySelector<HTMLElement>("[data-feedback]");
  const boardEl = app!.querySelector<HTMLElement>("[data-board]");
  if (!boardEl || !feedbackEl) return;

  locked = true;
  disableMatchChoices(boardEl);

  if (wasCorrect) {
    markMatchChoice(boardEl, chosen, "correct");
    showFeedback(feedbackEl, cheerMessage(), "correct");
    speakEn(round.answer.english);
  } else {
    markMatchChoice(boardEl, chosen, "incorrect");
    showFeedback(feedbackEl, encourageMessage(), "incorrect");
    window.setTimeout(
      () => markMatchChoice(boardEl, round.answer.hanzi, "reveal"),
      500,
    );
    flash(boardEl, "board--shake", 500);
  }

  commitAnswer(wasCorrect, wasCorrect ? 900 : 1400);
}

function onDrawComplete(): void {
  if (locked || round.kind !== "draw") return;
  locked = true;

  const feedbackEl = app!.querySelector<HTMLElement>("[data-feedback]");
  if (feedbackEl) {
    showFeedback(feedbackEl, cheerMessage(), "correct");
  }
  // Say the word they just drew aloud so the reveal is also audible.
  speakZh(round.answer.hanzi);
  window.setTimeout(() => speakEn(round.answer.english), 700);

  // Listen-and-draw: tapping Done always awards XP. It's practice, not a
  // quiz — the reveal that just appeared in the prompt card is the
  // learning moment. Advance slower so they can read it.
  commitAnswer(true, 2200);
}

function showFeedback(
  el: HTMLElement,
  text: string,
  kind: "correct" | "incorrect",
): void {
  el.textContent = text;
  el.classList.remove("feedback--correct", "feedback--incorrect");
  el.classList.add(`feedback--${kind}`);
}

function commitAnswer(wasCorrect: boolean, advanceMs: number): void {
  const result = recordAnswer(state, round.answer.hanzi, wasCorrect);
  state = result.state;
  saveState(state);

  reactToResult(result, wasCorrect);

  window.setTimeout(() => {
    round = nextRound();
    isNewWord = !state.seenHanzi.includes(round.answer.hanzi);
    // seenHanzi is updated *after* the answer, so the next prompt's "new"
    // status is evaluated against the already-updated list.
    locked = false;
    render();
  }, advanceMs);
}

function reactToResult(result: AnswerResult, wasCorrect: boolean): void {
  const stage = app!.querySelector<HTMLElement>("[data-kitty-stage]");
  if (!stage) return;

  if (result.justMaxed) {
    stage.classList.add("kitty-stage--celebrate");
    bigBurst();
    window.setTimeout(
      () => stage.classList.remove("kitty-stage--celebrate"),
      1400,
    );
    return;
  }
  if (result.leveledUp) {
    stage.classList.add("kitty-stage--celebrate");
    mediumBurst();
    window.setTimeout(
      () => stage.classList.remove("kitty-stage--celebrate"),
      1200,
    );
  } else if (wasCorrect) {
    stage.classList.add("kitty-stage--happy");
    burst({ count: 20, origin: { x: window.innerWidth / 2, y: 120 } });
    window.setTimeout(() => stage.classList.remove("kitty-stage--happy"), 700);
  } else {
    stage.classList.add("kitty-stage--sad");
    window.setTimeout(() => stage.classList.remove("kitty-stage--sad"), 600);
  }

  if (result.streakMilestone !== null) {
    showMilestone(
      `🔥 ${result.streakMilestone} in a row! +${result.bonusXp} bonus XP`,
    );
    mediumBurst();
  }
  if (result.dailyGoalHit) {
    showMilestone(`⭐ Daily goal! ${DAILY_STAR_GOAL} stars today!`);
    bigBurst();
  }
  if (result.newSticker) {
    const info = infoFor(result.newSticker);
    showMilestone(`${info.emoji} Sticker earned: ${info.label}!`);
    bigBurst();
  }
}

function mediumBurst(): void {
  burst({ count: 45, origin: { x: window.innerWidth / 2, y: 140 }, spread: 280 });
}

function bigBurst(): void {
  burst({ count: 80, origin: { x: window.innerWidth / 2, y: 120 }, spread: 340, durationMs: 1800 });
}

function showMilestone(message: string): void {
  const banner = document.createElement("div");
  banner.className = "milestone-banner";
  banner.textContent = message;
  document.body.appendChild(banner);
  window.setTimeout(() => banner.classList.add("milestone-banner--show"), 30);
  window.setTimeout(() => {
    banner.classList.remove("milestone-banner--show");
    window.setTimeout(() => banner.remove(), 400);
  }, 2200);
}

function onReset(): void {
  const ok = window.confirm("Start over with a brand new kitty?");
  if (!ok) return;
  state = resetKitty(state);
  clearState();
  saveState(state);
  round = nextRound();
  isNewWord = !state.seenHanzi.includes(round.answer.hanzi);
  render();
}
