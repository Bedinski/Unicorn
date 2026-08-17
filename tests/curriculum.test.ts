import { describe, expect, it } from "vitest";
import { CATEGORY_SCOPES, STUDY_SCOPES, WEEK_SCOPES } from "@/data/curriculum";
import { FIRST_GRADE_WEEKS, STUDY_CATEGORIES, wordsForWeek } from "@/data/firstGrade";
import { drawPool, poolsForScope, recognitionPool, scopeById } from "@/game/curriculum";

describe("First Grade curriculum", () => {
  it("offers twelve date-independent weeks and every source category", () => {
    expect(WEEK_SCOPES).toHaveLength(12);
    expect(CATEGORY_SCOPES).toHaveLength(STUDY_CATEGORIES.length);
    expect(STUDY_SCOPES).toHaveLength(12 + STUDY_CATEGORIES.length);
    expect(WEEK_SCOPES.every((scope) => !scope.label.match(/\b20\d\d\b/))).toBe(true);
  });

  it("includes every weekly dictation character in its week pool", () => {
    for (const week of FIRST_GRADE_WEEKS) {
      const hanzi = new Set(wordsForWeek(week).map((word) => word.hanzi));
      for (const expected of week.extraHanzi) expect(hanzi.has(expected), `${week.id}: ${expected}`).toBe(true);
    }
  });

  it("finds week and category scopes by stable ids", () => {
    expect(scopeById("week-01")?.label).toBe("Week 1: School Places");
    expect(scopeById("category:hfw-colors")?.label).toBe("Colors");
    expect(scopeById("missing")).toBeNull();
  });

  it("narrows practice to a selected week", () => {
    const scope = scopeById("week-03")!;
    const { recognitionPool: pool } = poolsForScope(scope);
    expect(pool.some((word) => word.hanzi === "鉛筆")).toBe(true);
    expect(pool.some((word) => word.hanzi === "學")).toBe(true);
  });

  it("narrows category practice and prefers single characters for writing", () => {
    const scope = scopeById("category:hfw-opposites")!;
    const { recognitionPool: recognition, drawPool: drawing } = poolsForScope(scope);
    expect(recognition.every((word) => word.categories.includes("hfw-opposites"))).toBe(true);
    expect(drawing.every((word) => [...word.hanzi].length === 1)).toBe(true);
  });

  it("keeps all-First-Grade pools playable", () => {
    expect(recognitionPool().length).toBeGreaterThan(200);
    expect(drawPool().length).toBeGreaterThan(3);
  });
});
