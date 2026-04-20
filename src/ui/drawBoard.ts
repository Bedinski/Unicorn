import type { DrawRound } from "@/game/rounds";

export interface DrawBoardHandlers {
  onReveal: () => void;
  onReplayAudio: () => void;
  onGotIt: () => void;
  onNeedsPractice: () => void;
}

export function renderDrawBoard(round: DrawRound): string {
  const hanzi = escapeHtml(round.answer.hanzi);
  const pinyin = escapeHtml(round.answer.pinyin);

  return `
    <section class="prompt-card prompt-card--draw" data-prompt>
      <button class="replay-audio" data-replay type="button" aria-label="Play pronunciation">🔊</button>
      <div class="draw-instruction">Listen and draw the character</div>
      <div class="reference" data-reference hidden>
        <div class="reference-label">Answer:</div>
        <div class="hanzi" data-hanzi>${hanzi}</div>
        <div class="pinyin" data-pinyin>${pinyin}</div>
      </div>
    </section>
    <section class="draw-area">
      <canvas class="draw-canvas"
              data-canvas
              aria-label="Draw the character here"
              width="320"
              height="320"></canvas>
    </section>
    <section class="draw-controls" data-controls>
      <button class="draw-btn draw-btn--clear" data-action="clear" type="button">🧽 Clear</button>
      <button class="draw-btn draw-btn--reveal" data-action="reveal" type="button">👀 Show answer</button>
      <button class="draw-btn draw-btn--correct" data-action="correct" type="button" hidden>✅ I got it</button>
      <button class="draw-btn draw-btn--incorrect" data-action="incorrect" type="button" hidden>📝 Needs practice</button>
    </section>
  `;
}

/**
 * Wires pointer events to the canvas and button actions to the handlers.
 * Returns a dispose function that removes all listeners.
 */
export function wireDrawBoard(
  root: HTMLElement,
  handlers: DrawBoardHandlers,
): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-canvas]");
  const controls = root.querySelector<HTMLElement>("[data-controls]");
  const reference = root.querySelector<HTMLElement>("[data-reference]");
  const replayBtn = root.querySelector<HTMLButtonElement>("[data-replay]");

  if (!canvas || !controls || !reference || !replayBtn) {
    return () => {};
  }

  const disposers: Array<() => void> = [];
  initCanvas(canvas, disposers);

  const revealBtn = controls.querySelector<HTMLButtonElement>(
    '[data-action="reveal"]',
  );
  const clearBtn = controls.querySelector<HTMLButtonElement>(
    '[data-action="clear"]',
  );
  const gotItBtn = controls.querySelector<HTMLButtonElement>(
    '[data-action="correct"]',
  );
  const practiceBtn = controls.querySelector<HTMLButtonElement>(
    '[data-action="incorrect"]',
  );

  const onClear = () => clearCanvas(canvas);
  clearBtn?.addEventListener("click", onClear);
  disposers.push(() => clearBtn?.removeEventListener("click", onClear));

  const onReveal = () => {
    reference.hidden = false;
    if (revealBtn) revealBtn.hidden = true;
    if (gotItBtn) gotItBtn.hidden = false;
    if (practiceBtn) practiceBtn.hidden = false;
    handlers.onReveal();
  };
  revealBtn?.addEventListener("click", onReveal);
  disposers.push(() => revealBtn?.removeEventListener("click", onReveal));

  gotItBtn?.addEventListener("click", handlers.onGotIt);
  disposers.push(() =>
    gotItBtn?.removeEventListener("click", handlers.onGotIt),
  );

  practiceBtn?.addEventListener("click", handlers.onNeedsPractice);
  disposers.push(() =>
    practiceBtn?.removeEventListener("click", handlers.onNeedsPractice),
  );

  replayBtn.addEventListener("click", handlers.onReplayAudio);
  disposers.push(() =>
    replayBtn.removeEventListener("click", handlers.onReplayAudio),
  );

  return () => disposers.forEach((fn) => fn());
}

function initCanvas(
  canvas: HTMLCanvasElement,
  disposers: Array<() => void>,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const ratio = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const cssSize = canvas.clientWidth || canvas.width || 320;
  canvas.width = cssSize * ratio;
  canvas.height = cssSize * ratio;
  canvas.style.height = `${cssSize}px`;
  ctx.scale(ratio, ratio);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#2d1b4e";

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  const getPos = (e: PointerEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * cssSize) / rect.width,
      y: ((e.clientY - rect.top) * cssSize) / rect.height,
    };
  };

  const onDown = (e: PointerEvent) => {
    drawing = true;
    const { x, y } = getPos(e);
    lastX = x;
    lastY = y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
    canvas.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  };

  const onUp = (e: PointerEvent) => {
    drawing = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if pointer was never captured
    }
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("pointerleave", onUp);

  disposers.push(() => {
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("pointerleave", onUp);
  });
}

function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ratio = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  // re-apply scale for subsequent drawing
  ctx.scale(ratio, ratio);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
