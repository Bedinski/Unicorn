import { describe, expect, it } from "vitest";
import {
  currentWeek,
  currentWeekSummary,
  drawPool,
  recognitionPool,
  taughtCategories,
  taughtDictation,
} from "@/game/curriculum";

describe("curriculum schedule helpers", () => {
  it("currentWeek returns the active week when inside its range", () => {
    // 2026-04-20 is day 1 of the "opposites" recognition week
    const w = currentWeek(new Date(2026, 3, 20));
    expect(w).not.toBeNull();
    expect(w!.type).toBe("recognition");
    expect(w!.content).toContain("opposites");
  });

  it("currentWeek returns null between assessment weeks", () => {
    // The schedule has a gap the weekend of 2026-04-24 to 2026-04-26
    const w = currentWeek(new Date(2026, 3, 25));
    expect(w).toBeNull();
  });

  it("taughtCategories accumulates across the school year", () => {
    const early = taughtCategories(new Date(2026, 1, 18));
    expect(early).toContain("numbers");
    expect(early).not.toContain("opposites");

    const later = taughtCategories(new Date(2026, 3, 20));
    expect(later).toContain("numbers");
    expect(later).toContain("animals");
    expect(later).toContain("opposites");
  });

  it("taughtDictation grows each dictation week", () => {
    const afterWk1 = taughtDictation(new Date(2026, 1, 13));
    expect(afterWk1.map((d) => d.hanzi)).toEqual([
      "大", "小", "日", "月", "上", "下", "左", "右",
    ]);
    const afterWk3 = taughtDictation(new Date(2026, 2, 13));
    expect(afterWk3.length).toBe(8 + 8 + 8);
  });

  it("recognitionPool only contains words from taught categories", () => {
    const pool = recognitionPool(new Date(2026, 1, 18));
    expect(pool.length).toBeGreaterThan(0);
    // numbers was the first recognition topic
    expect(pool.some((w) => w.category === "numbers")).toBe(true);
    // opposites hasn't been taught yet as of 2/18
    expect(pool.some((w) => w.category === "opposites")).toBe(false);
  });

  it("drawPool uses the dictation list once there are taught characters", () => {
    const pool = drawPool(new Date(2026, 1, 13));
    expect(pool.length).toBe(8);
    expect(pool.map((w) => w.hanzi)).toContain("大");
  });

  it("drawPool falls back to the full word list before any dictation week", () => {
    const pool = drawPool(new Date(2026, 0, 1));
    expect(pool.length).toBeGreaterThan(0);
  });

  it("currentWeekSummary returns a human-readable string", () => {
    const s = currentWeekSummary(new Date(2026, 3, 20));
    expect(s).toMatch(/opposites/i);
    const d = currentWeekSummary(new Date(2026, 1, 10));
    expect(d).toMatch(/大/);
  });
});
