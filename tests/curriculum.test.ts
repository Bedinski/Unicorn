import { describe, expect, it } from "vitest";
import { CATEGORY_SCOPES, STUDY_SCOPES, WEEK_SCOPES } from "@/data/curriculum";
import {
  FIRST_GRADE_WEEKS,
  STUDY_CATEGORIES,
  wordsForCategory,
  wordsForWeek,
} from "@/data/firstGrade";
import { drawPool, poolsForScope, recognitionPool, scopeById } from "@/game/curriculum";

describe("source-anchored First Grade curriculum", () => {
  it("offers twelve date-independent weeks and every source category", () => {
    expect(WEEK_SCOPES).toHaveLength(12);
    expect(CATEGORY_SCOPES).toHaveLength(STUDY_CATEGORIES.length);
    expect(STUDY_SCOPES).toHaveLength(12 + STUDY_CATEGORIES.length);
    expect(WEEK_SCOPES.every((scope) => !scope.label.match(/\b20\d\d\b/))).toBe(true);
  });

  it("orders Meizhou chapters numerically instead of copying last year's test dates", () => {
    const chapters = FIRST_GRADE_WEEKS
      .filter((week) => week.title.startsWith("Meizhou Chapter"))
      .map((week) => Number(week.title.match(/\d+/)?.[0]));
    expect(chapters).toEqual([1, 2, 3, 4, 8, 10]);
    expect(FIRST_GRADE_WEEKS.map((week) => week.title)).toEqual([
      "School Places",
      "Meizhou Chapter 1",
      "School Supplies",
      "Meizhou Chapter 2",
      "Family & Hobbies",
      "Meizhou Chapter 3",
      "Taste, Opposites & Feelings",
      "Meizhou Chapter 4",
      "Action Words",
      "Meizhou Chapter 8",
      "Weather, Body & Useful Words",
      "Meizhou Chapter 10",
    ]);
  });

  it("builds every week from exactly its recognition and dictation lists", () => {
    for (const week of FIRST_GRADE_WEEKS) {
      const expected = [...new Set([...week.recognitionHanzi, ...week.dictationHanzi])];
      const actual = wordsForWeek(week).map((word) => word.hanzi);
      expect(actual, week.id).toEqual(expected);
    }
  });

  it("preserves each category master's own item order", () => {
    for (const category of STUDY_CATEGORIES) {
      expect(wordsForCategory(category.id).map((word) => word.hanzi), category.id)
        .toEqual(category.items.map(([hanzi]) => hanzi));
    }
  });

  it("matches the audited source item counts", () => {
    expect(Object.fromEntries(STUDY_CATEGORIES.map((category) => [category.id, category.items.length])))
      .toEqual({
        "hfw-opposites": 14,
        "hfw-family": 6,
        "hfw-school-places": 12,
        "hfw-taste": 10,
        "hfw-feelings": 8,
        "hfw-school-supplies": 10,
        "hfw-weather": 4,
        "hfw-colors": 6,
        "hfw-hobbies": 8,
        "hfw-verbs": 10,
        "hfw-animals": 6,
        "hfw-body-parts": 6,
        "hfw-misc": 9,
        dictation: 64,
        "meizhou-1": 17,
        "meizhou-2": 16,
        "meizhou-3": 16,
        "meizhou-4": 16,
        "meizhou-5": 16,
        "meizhou-6": 16,
        "meizhou-7": 16,
        "meizhou-8": 10,
        "meizhou-10": 16,
      });
  });

  it("keeps the complete dictation category limited to its 64-item master list", () => {
    const dictation = wordsForCategory("dictation");
    expect(dictation).toHaveLength(64);
    expect(dictation.some((word) => word.hanzi === "冰淇淋")).toBe(true);
    expect(dictation.some((word) => word.hanzi === "學")).toBe(false);
    expect(dictation.some((word) => word.hanzi === "汁")).toBe(false);
  });

  it("preserves source category boundaries and weekly subsets", () => {
    expect(wordsForCategory("hfw-family").map((word) => word.hanzi)).not.toContain("父母");
    expect(wordsForCategory("hfw-misc").map((word) => word.hanzi)).toEqual(
      expect.arrayContaining(["父母", "生日"]),
    );
    const supplies = wordsForWeek(FIRST_GRADE_WEEKS[2]).map((word) => word.hanzi);
    expect(supplies).toContain("鉛筆");
    expect(supplies).not.toContain("年級");
    const tasteWeek = wordsForWeek(FIRST_GRADE_WEEKS[6]).map((word) => word.hanzi);
    expect(tasteWeek).toContain("鹹");
    expect(tasteWeek).not.toContain("分");
    expect(tasteWeek).not.toContain("喜歡");
  });

  it("finds and narrows stable week/category scopes", () => {
    expect(scopeById("week-02")?.label).toBe("Week 2: Meizhou Chapter 1");
    expect(scopeById("category:hfw-colors")?.label).toBe("Colors");
    expect(scopeById("missing")).toBeNull();
    const week = poolsForScope(scopeById("week-03")!).recognitionPool;
    expect(week.some((word) => word.hanzi === "鉛筆")).toBe(true);
    expect(week.some((word) => word.hanzi === "學")).toBe(true);
    const { recognitionPool: category, drawPool: drawing } = poolsForScope(scopeById("category:hfw-opposites")!);
    expect(category.every((word) => word.categories.includes("hfw-opposites"))).toBe(true);
    expect(drawing.every((word) => [...word.hanzi].length === 1)).toBe(true);
  });

  it("keeps all-First-Grade pools playable", () => {
    expect(recognitionPool().length).toBeGreaterThan(200);
    expect(drawPool().length).toBeGreaterThan(3);
  });
});
