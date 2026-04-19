import { describe, expect, it } from "vitest";
import {
  MAX_LEVEL,
  XP_THRESHOLDS,
  isMaxLevel,
  levelForXp,
  xpIntoCurrentLevel,
  xpNeededForNextLevel,
} from "@/game/levels";

describe("levels", () => {
  it("starts at level 1 with 0 xp", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("returns the correct level at each threshold boundary", () => {
    XP_THRESHOLDS.forEach((threshold, idx) => {
      expect(levelForXp(threshold)).toBe(idx + 1);
    });
  });

  it("returns previous level just below a threshold", () => {
    expect(levelForXp(2)).toBe(1);
    expect(levelForXp(6)).toBe(2);
    expect(levelForXp(11)).toBe(3);
  });

  it("clamps to MAX_LEVEL above the highest threshold", () => {
    expect(levelForXp(1000)).toBe(MAX_LEVEL);
    expect(isMaxLevel(1000)).toBe(true);
  });

  it("treats negative or fractional xp as level 1", () => {
    expect(levelForXp(-5)).toBe(1);
    expect(levelForXp(0.9)).toBe(1);
  });

  it("xpIntoCurrentLevel reports progress from the current threshold", () => {
    expect(xpIntoCurrentLevel(0)).toBe(0);
    expect(xpIntoCurrentLevel(2)).toBe(2); // level 1 still
    expect(xpIntoCurrentLevel(3)).toBe(0); // just leveled to 2
    expect(xpIntoCurrentLevel(5)).toBe(2); // level 2, +2
  });

  it("xpNeededForNextLevel equals the span between thresholds and is 0 at max", () => {
    expect(xpNeededForNextLevel(0)).toBe(3); // level 1 span: 3-0
    expect(xpNeededForNextLevel(3)).toBe(4); // level 2 span: 7-3
    expect(xpNeededForNextLevel(XP_THRESHOLDS[MAX_LEVEL - 1])).toBe(0);
    expect(xpNeededForNextLevel(99999)).toBe(0);
  });
});
