import type { WordCategory } from "@/data/words";
import type { CategoryCorrect } from "@/game/state";
import { STICKER_THRESHOLD } from "@/game/state";
import { STUDY_CATEGORIES } from "@/data/firstGrade";

export interface StickerInfo {
  category: WordCategory;
  label: string;
  emoji: string;
}

export const STICKERS: readonly StickerInfo[] = STUDY_CATEGORIES.map((category) => ({
  category: category.id,
  label: `${category.label} Star`,
  emoji: category.emoji,
}));

export function infoFor(category: WordCategory): StickerInfo {
  const match = STICKERS.find((s) => s.category === category);
  if (!match) throw new Error(`Unknown sticker category: ${category}`);
  return match;
}

export function renderStickerBook(
  categoryCorrect: CategoryCorrect,
  earned: readonly WordCategory[],
): string {
  const earnedSet = new Set(earned);
  const tiles = STICKERS.map((s) => {
    const count = categoryCorrect[s.category] ?? 0;
    const isEarned = earnedSet.has(s.category);
    const progress = Math.min(count, STICKER_THRESHOLD);
    const pct = Math.round((progress / STICKER_THRESHOLD) * 100);
    return `
      <li class="sticker ${isEarned ? "sticker--earned" : "sticker--locked"}">
        <div class="sticker-emoji" aria-hidden="true">${s.emoji}</div>
        <div class="sticker-label">${s.label}</div>
        ${
          isEarned
            ? `<div class="sticker-status">Earned!</div>`
            : `<div class="sticker-progress"><div class="sticker-progress-fill" style="width:${pct}%"></div></div>
               <div class="sticker-status">${progress}/${STICKER_THRESHOLD}</div>`
        }
      </li>`;
  }).join("");

  return `
    <div class="sticker-book" data-sticker-book role="dialog" aria-modal="true" aria-label="Sticker book">
      <div class="sticker-book-inner">
        <header class="sticker-book-header">
          <h2>🏅 Sticker Book</h2>
          <button class="sticker-book-close" data-close type="button" aria-label="Close">✕</button>
        </header>
        <p class="sticker-book-subtitle">
          Earn a sticker by answering ${STICKER_THRESHOLD} questions correctly in each category.
        </p>
        <ul class="sticker-grid">
          ${tiles}
        </ul>
        <div class="sticker-book-summary">
          ${earned.length} of ${STICKERS.length} stickers earned
        </div>
      </div>
    </div>`;
}

export function stickerSummary(
  categoryCorrect: CategoryCorrect,
): { earnedCount: number; total: number } {
  const earnedCount = STICKERS.filter(
    (s) => (categoryCorrect[s.category] ?? 0) >= STICKER_THRESHOLD,
  ).length;
  return { earnedCount, total: STICKERS.length };
}
