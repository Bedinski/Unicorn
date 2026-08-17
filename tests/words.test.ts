import { describe, expect, it } from "vitest";
import { FIRST_GRADE_WORDS } from "@/data/firstGrade";
import { WORDS } from "@/data/words";

describe("word bank integrity", () => {
  it("exports the First Grade catalog as the one runtime word source", () => {
    expect(WORDS).toBe(FIRST_GRADE_WORDS);
  });

  it("has at least 20 entries so rounds always have distractors", () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(20);
  });

  it("hanzi characters are all unique", () => {
    const seen = new Set<string>();
    for (const w of WORDS) {
      expect(seen.has(w.hanzi), `duplicate hanzi: ${w.hanzi}`).toBe(false);
      seen.add(w.hanzi);
    }
  });

  it("tracks every category that contains a shared word", () => {
    for (const w of WORDS) {
      if (w.weeklyOnly) expect(w.categories).toEqual([]);
      else expect(w.categories).toContain(w.category);
      expect(new Set(w.categories).size).toBe(w.categories.length);
    }
  });

  it("every entry has non-empty hanzi, english, pinyin, and a category", () => {
    for (const w of WORDS) {
      expect(w.hanzi.length).toBeGreaterThan(0);
      expect(w.english.length).toBeGreaterThan(0);
      expect(w.pinyin.length).toBeGreaterThan(0);
      expect(w.category.length).toBeGreaterThan(0);
    }
  });

  it("does not expose words unique to the archived pre–First Grade catalog", () => {
    const archivedOnly = [
      "你好", "耳朵", "鼻子", "眼睛", "紅色", "日期", "朋友的家", "開心",
    ];
    const active = new Set(WORDS.map((word) => word.hanzi));
    expect(archivedOnly.filter((hanzi) => active.has(hanzi))).toEqual([]);
  });
});
