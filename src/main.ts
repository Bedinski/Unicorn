/// <reference types="vite/client" />
import "./style.css";
import {
  currentWeekSummary,
  drawPool,
  poolsForWeek,
  recognitionPool,
  weekByStart,
  weekLabel,
} from "@/game/curriculum";
import { CURRICULUM } from "@/data/curriculum";
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
import { renderTeacherCard, wireTeacherCard } from "@/ui/teacherCard";
import { canSpeak, speakEn, speakZh } from "@/ui/speech";
import {
  STICKERS,
  infoFor,
  renderStickerBook,
  stickerSummary,
} from "@/ui/stickers";
import { HomeworkApp } from "@/homework/ui";

const app = document.getElementById("app");
if (!app) throw new Error("#app root not found");

let appMode: "homework" | "game" = "homework";
const homeworkApp = new HomeworkApp(app, {
  onFreePlay: () => {
    appMode = "game";
    render();
  },
});

let state: GameState = loadState();
let round: Round = nextRound();
let isNewWord = !state.seenHanzi.includes(round.answer.hanzi);
let locked = false;
let disposeBoard: (() => void) | null = null;
let stickerBookOpen = false;

// Teacher-mode deck state (ephemeral; rebuilt whenever practice scope changes).
let teacherDeck: import("@/data/words").Word[] = [];
let teacherIndex = 0;
if (state.teacherMode) rebuildTeacherDeck();

render();

function rebuildTeacherDeck(): void {
  // Use the recognition pool so teacher mode includes every word in scope
  // (compounds like 耳朵 / 你好 too), not just single characters. The draw
  // pool's single-char filter exists for in-app Draw rounds; on paper the
  // child can write any word, so it doesn't apply here.
  const { recognition } = currentPools();
  // Preserve curriculum order; no shuffle so the parent can predict what's
  // coming and a child can re-do specific cards via the Previous button.
  teacherDeck = recognition.slice();
  teacherIndex = 0;
}

function nextRound(): Round {
  const kind = pickRoundType(Math.random, canSpeak());
  const { recognition, draw } = currentPools();
  const pool = kind === "draw" ? draw : recognition;
  // Pool must have at least 3 entries so MCQ/Match can build distractors.
  const safePool = pool.length >= 3 ? pool : recognition.length >= 3 ? recognition : recognitionPool();
  return buildRound(safePool, state.recentHanzi, Math.random, kind);
}

/**
 * The active practice pools. If the player has selected a curriculum week
 * to focus on (test-prep mode) we narrow both pools to that week's
 * content; otherwise we fall back to the taught-so-far pools.
 */
function currentPools(): { recognition: ReturnType<typeof recognitionPool>; draw: ReturnType<typeof drawPool> } {
  if (state.selectedWeekStart) {
    const week = weekByStart(state.selectedWeekStart);
    if (week) {
      const { recognitionPool: recog, drawPool: drawn } = poolsForWeek(week);
      return { recognition: recog, draw: drawn };
    }
  }
  return { recognition: recognitionPool(), draw: drawPool() };
}

function render(): void {
  disposeBoard?.();
  disposeBoard = null;

  if (appMode === "homework") {
    homeworkApp.render();
    return;
  }

  const level = levelForXp(state.xp);
  const levelXp = xpIntoCurrentLevel(state.xp);
  const nextXp = xpNeededForNextLevel(state.xp);
  const progressPct =
    nextXp === 0 ? 100 : Math.round((levelXp / nextXp) * 100);
  const max = isMaxLevel(state.xp);

  const teacherMode = state.teacherMode;
  const currentTeacherWord =
    teacherMode && teacherIndex < teacherDeck.length
      ? teacherDeck[teacherIndex]
      : null;

  const boardHtml = teacherMode
    ? renderTeacherCard(currentTeacherWord, teacherIndex, teacherDeck.length)
    : renderRoundBoard(round);
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

    <section class="practice-select" aria-label="Practice focus">
      <button class="homework-return" data-open-homework type="button">
        📚 Back to Homework
      </button>
      <div class="practice-row">
        <label class="practice-select-label" for="practice-week">🎯 Practice:</label>
        <select id="practice-week" class="practice-select-input" data-practice-select>
          <option value=""${state.selectedWeekStart ? "" : " selected"}>Everything taught so far</option>
          ${renderWeekOptions()}
        </select>
      </div>
      <button class="teacher-toggle ${state.teacherMode ? "teacher-toggle--on" : ""}"
              data-teacher-toggle type="button"
              aria-pressed="${state.teacherMode}">
        ${state.teacherMode ? "🎮 Back to Game" : "👨‍🏫 Teacher Mode (Dictation)"}
      </button>
    </section>

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

    ${
      teacherMode
        ? ""
        : `
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
    </section>`
    }

    <section class="board board--${teacherMode ? "teacher" : round.kind}" data-board>
      ${
        !teacherMode && isNewWord
          ? `<div class="new-badge" data-new-badge>✨ NEW WORD!</div>`
          : ""
      }
      ${boardHtml}
    </section>

    ${teacherMode ? "" : `<section class="feedback" data-feedback aria-live="polite"></section>`}

    <footer class="bottom-bar">
      <button class="sticker-btn" data-open-stickers type="button" aria-label="Open sticker book">
        🏅 <span class="sticker-count">${earnedCount}/${total}</span>
      </button>
      ${
        teacherMode
          ? ""
          : max
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
  // (In teacher mode wireBoard handles its own deferred speak for the
  // active card, so we skip the round-based one.)
  if (!state.teacherMode) {
    window.setTimeout(() => speakZh(round.answer.hanzi), 120);
  }
}

function earnedCategoriesList() {
  return STICKERS.map((s) => s.category).filter(
    (c) => (state.categoryCorrect[c] ?? 0) >= 5,
  );
}

function renderWeekOptions(): string {
  const todayIsoStr = isoToday();
  return CURRICULUM.map((w) => {
    const selected = state.selectedWeekStart === w.startDate ? " selected" : "";
    const current = todayIsoStr >= w.startDate && todayIsoStr <= w.endDate;
    const star = current ? " ★" : "";
    const type = w.type === "dictation" ? "✍️" : "📖";
    const label = weekLabel(w);
    return `<option value="${w.startDate}"${selected}>${type} ${label}${star}</option>`;
  }).join("");
}

function isoToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function renderRoundBoard(r: Round): string {
  if (r.kind === "mcq") return renderBoard(r);
  if (r.kind === "draw") return renderDrawBoard(r);
  return renderMatchBoard(r);
}

function wireBoard(): void {
  const boardEl = app!.querySelector<HTMLElement>("[data-board]")!;
  if (state.teacherMode) {
    disposeBoard = wireTeacherCard(boardEl, {
      onListen: () => {
        const w = teacherDeck[teacherIndex];
        if (w) speakZh(w.hanzi);
      },
      onNext: () => {
        teacherIndex++;
        render();
      },
      onPrev: () => {
        if (teacherIndex > 0) {
          teacherIndex--;
          render();
        }
      },
      onRestart: () => {
        rebuildTeacherDeck();
        render();
      },
    });
    // Teacher mode: audio only plays when the Listen button is pressed,
    // so the parent can preview the card silently first.
    return;
  }
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
    .querySelector<HTMLButtonElement>("[data-open-homework]")
    ?.addEventListener("click", () => {
      appMode = "homework";
      locked = false;
      render();
    });
  app!
    .querySelector<HTMLButtonElement>("[data-reset]")
    ?.addEventListener("click", onReset);
  app!
    .querySelector<HTMLButtonElement>("[data-open-stickers]")
    ?.addEventListener("click", () => {
      stickerBookOpen = true;
      render();
    });
  app!
    .querySelector<HTMLSelectElement>("[data-practice-select]")
    ?.addEventListener("change", onPracticeWeekChange);
  app!
    .querySelector<HTMLButtonElement>("[data-teacher-toggle]")
    ?.addEventListener("click", onToggleTeacherMode);
}

function onToggleTeacherMode(): void {
  const next = !state.teacherMode;
  state = { ...state, teacherMode: next };
  saveState(state);
  if (next) rebuildTeacherDeck();
  locked = false;
  render();
}

function onPracticeWeekChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  const value = select.value || null;
  if (value === state.selectedWeekStart) return;
  state = { ...state, selectedWeekStart: value };
  saveState(state);
  if (state.teacherMode) {
    rebuildTeacherDeck();
  } else {
    round = nextRound();
    isNewWord = !state.seenHanzi.includes(round.answer.hanzi);
  }
  locked = false;
  render();
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
