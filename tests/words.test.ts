import { describe, expect, it } from "vitest";
import { WORDS } from "@/data/words";

describe("word bank integrity", () => {
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

  it("english glosses are all unique (so distractors can't collide with the answer)", () => {
    const seen = new Set<string>();
    for (const w of WORDS) {
      expect(seen.has(w.english), `duplicate english: ${w.english}`).toBe(
        false,
      );
      seen.add(w.english);
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
});
