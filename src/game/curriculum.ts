import { CATEGORY_SCOPES, STUDY_SCOPES, WEEK_SCOPES, type StudyScope } from "@/data/curriculum";
import { wordsForCategory, wordsForWeek } from "@/data/firstGrade";
import { WORDS, type Word } from "@/data/words";

export { CATEGORY_SCOPES, STUDY_SCOPES, WEEK_SCOPES };

export function recognitionPool(): Word[] {
  return WORDS.slice();
}

export function drawPool(): Word[] {
  const singles = WORDS.filter((word) => [...word.hanzi].length === 1);
  return singles.length >= 3 ? singles : WORDS.slice();
}

export function scopeById(id: string): StudyScope | null {
  return STUDY_SCOPES.find((scope) => scope.id === id) ?? null;
}

export function scopeLabel(scope: StudyScope): string {
  return scope.label;
}

export function poolsForScope(scope: StudyScope): {
  recognitionPool: Word[];
  drawPool: Word[];
} {
  const pool = scope.kind === "week"
    ? wordsForWeek(scope.week)
    : wordsForCategory(scope.category.id);
  const singles = pool.filter((word) => [...word.hanzi].length === 1);
  return {
    recognitionPool: pool,
    drawPool: singles.length >= 3 ? singles : pool,
  };
}
