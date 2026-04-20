import type { DrawRound } from "@/game/rounds";

export interface DrawBoardHandlers {
  onReplayAudio: () => void;
  onDone: () => void;
}

export function renderDrawBoard(round: DrawRound): string {
  const hanzi = escapeHtml(round.answer.hanzi);
  const pinyin = escapeHtml(round.answer.pinyin);
  const english = escapeHtml(round.answer.english);

  return `
    <section class="prompt-card prompt-card--draw" data-prompt>
      <button class="replay-audio replay-audio--large" data-replay type="button" aria-label="Play pronunciation">
        <span class="replay-icon">🔊</span>
        <span class="replay-label">Listen</span>
      </button>
      <div class="draw-instruction">Listen and draw the character</div>
      <div class="reference" data-reference hidden>
        <div class="reference-label">That was:</div>
        <div class="hanzi" data-hanzi>${hanzi}</div>
        <div class="pinyin" data-pinyin>${pinyin}</div>
        <div class="reference-english">${english}</div>
      </div>
    </section>
    <section class="draw-area">
      <canvas class="draw-canvas"
              data-canvas
              aria-label="Draw the character here"></canvas>
    </section>
    <section class="draw-controls" data-controls>
      <button class="draw-btn draw-btn--clear" data-action="clear" type="button">🧽 Clear</button>
      <button class="draw-btn draw-btn--done" data-action="done" type="button">✅ Done!</button>
    </section>
  `;
}

/**
 * Wires pointer events + button actions. Returns a dispose function that
 * removes listeners and any ResizeObserver.
 */
export function wireDrawBoard(
  root: HTMLElement,
  handlers: DrawBoardHandlers,
): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-canvas]");
  const replayBtn = root.querySelector<HTMLButtonElement>("[data-replay]");
  const clearBtn = root.querySelector<HTMLButtonElement>(
    '[data-action="clear"]',
  );
  const doneBtn = root.querySelector<HTMLButtonElement>(
    '[data-action="done"]',
  );

  if (!canvas || !replayBtn || !clearBtn || !doneBtn) {
    return () => {};
  }

  const disposers: Array<() => void> = [];
  initCanvas(canvas, disposers);

  const reference = root.querySelector<HTMLElement>("[data-reference]");

  const onClear = () => clearCanvas(canvas);
  clearBtn.addEventListener("click", onClear);
  disposers.push(() => clearBtn.removeEventListener("click", onClear));

  const onDone = () => {
    if (reference) reference.hidden = false;
    doneBtn.disabled = true;
    clearBtn.disabled = true;
    handlers.onDone();
  };
  doneBtn.addEventListener("click", onDone);
  disposers.push(() => doneBtn.removeEventListener("click", onDone));

  replayBtn.addEventListener("click", handlers.onReplayAudio);
  disposers.push(() =>
    replayBtn.removeEventListener("click", handlers.onReplayAudio),
  );

  return () => disposers.forEach((fn) => fn());
}

/**
 * Measures the canvas's actual rendered CSS size (after layout), sets the
 * internal bitmap to that size × devicePixelRatio so lines are crisp on
 * HiDPI, and re-syncs whenever the element resizes (orientation change,
 * window resize, etc.). We explicitly do NOT set any inline style.width or
 * style.height so the CSS-driven responsive sizing keeps working.
 */
function initCanvas(
  canvas: HTMLCanvasElement,
  disposers: Array<() => void>,
): void {
  const state = {
    cssSize: 320,
    lastX: 0,
    lastY: 0,
    drawing: false,
  };

  const sync = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    // Fall back to the attribute when no layout yet (tests, off-screen).
    const size = Math.round(rect.width) || canvas.width || 320;
    if (size === 0) return;
    const ratio = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const targetBitmap = size * ratio;
    if (canvas.width !== targetBitmap || canvas.height !== targetBitmap) {
      canvas.width = targetBitmap;
      canvas.height = targetBitmap;
    }
    state.cssSize = size;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#2d1b4e";
  };

  sync();
  // Re-sync once the first paint completes so rect.width has laid out.
  requestAnimationFrame(sync);

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    disposers.push(() => ro.disconnect());
  } else {
    const onResize = () => sync();
    window.addEventListener("resize", onResize);
    disposers.push(() => window.removeEventListener("resize", onResize));
  }

  const getPos = (e: PointerEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || state.cssSize;
    const h = rect.height || state.cssSize;
    return {
      x: ((e.clientX - rect.left) * state.cssSize) / w,
      y: ((e.clientY - rect.top) * state.cssSize) / h,
    };
  };

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const onDown = (e: PointerEvent) => {
    state.drawing = true;
    const { x, y } = getPos(e);
    state.lastX = x;
    state.lastY = y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture isn't strictly needed; drawing still works without it
    }
    e.preventDefault();
  };

  const onMove = (e: PointerEvent) => {
    if (!state.drawing) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    state.lastX = x;
    state.lastY = y;
    e.preventDefault();
  };

  const onUp = (e: PointerEvent) => {
    state.drawing = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // fine if never captured
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
  ctx.scale(ratio, ratio);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#2d1b4e";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
