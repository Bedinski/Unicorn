export const MAX_LEVEL = 10;

export const XP_THRESHOLDS: readonly number[] = [
  0, 3, 7, 12, 18, 25, 33, 42, 52, 63,
];

export function levelForXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (safeXp >= XP_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

export function xpIntoCurrentLevel(xp: number): number {
  const level = levelForXp(xp);
  return xp - XP_THRESHOLDS[level - 1];
}

export function xpNeededForNextLevel(xp: number): number {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return 0;
  return XP_THRESHOLDS[level] - XP_THRESHOLDS[level - 1];
}

export function isMaxLevel(xp: number): boolean {
  return levelForXp(xp) >= MAX_LEVEL;
}
