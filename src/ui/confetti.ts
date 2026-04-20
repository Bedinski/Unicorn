const COLORS = [
  "#ec4899", // pink
  "#f97316", // orange
  "#fbbf24", // yellow
  "#10b981", // green
  "#38bdf8", // blue
  "#7c3aed", // purple
  "#f43f5e", // red
];

export interface BurstOptions {
  count?: number;
  /** Duration in ms; confetti is removed after this plus a small buffer. */
  durationMs?: number;
  /** Where on the screen to center the burst. Defaults to top-center. */
  origin?: { x: number; y: number };
  /** Spread in pixels left/right and downward. */
  spread?: number;
  /** Size range in pixels. */
  size?: [number, number];
}

/**
 * Fires a confetti burst from `origin` (defaults to the top of the viewport).
 * Each piece is an absolutely positioned element that is animated with inline
 * styles + a keyframe set via the CSS class `confetti-piece`. Pieces self-
 * remove after the animation so there is no long-lived DOM leak.
 */
export function burst(options: BurstOptions = {}): void {
  if (typeof document === "undefined") return;
  const {
    count = 30,
    durationMs = 1400,
    origin,
    spread = 220,
    size = [8, 14],
  } = options;

  const host = ensureHost();
  const startX = origin?.x ?? window.innerWidth / 2;
  const startY = origin?.y ?? 80;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const px = size[0] + Math.random() * (size[1] - size[0]);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const dx = (Math.random() - 0.5) * spread * 2;
    const dy = spread * (0.6 + Math.random() * 0.9);
    const rot = (Math.random() - 0.5) * 720;
    const delay = Math.random() * 100;
    const dur = durationMs * (0.7 + Math.random() * 0.6);

    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.width = `${px}px`;
    piece.style.height = `${px * 0.6}px`;
    piece.style.background = color;
    piece.style.setProperty("--confetti-dx", `${dx}px`);
    piece.style.setProperty("--confetti-dy", `${dy}px`);
    piece.style.setProperty("--confetti-rot", `${rot}deg`);
    piece.style.animationDuration = `${dur}ms`;
    piece.style.animationDelay = `${delay}ms`;

    host.appendChild(piece);
    const cleanup = () => piece.remove();
    piece.addEventListener("animationend", cleanup, { once: true });
    // Safety fallback in case animationend never fires (tests, reduced motion)
    window.setTimeout(cleanup, dur + delay + 200);
  }
}

function ensureHost(): HTMLElement {
  let host = document.querySelector<HTMLElement>("[data-confetti-host]");
  if (host) return host;
  host = document.createElement("div");
  host.setAttribute("data-confetti-host", "");
  host.className = "confetti-host";
  document.body.appendChild(host);
  return host;
}
