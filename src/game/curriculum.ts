import { CURRICULUM, type AssessmentWeek } from "@/data/curriculum";
import { DICTATION, type DictationEntry } from "@/data/dictation";
import { WORDS, type Word, type WordCategory } from "@/data/words";
import { todayIso } from "./state";

function cmpIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The assessment week covering `now`, if any. */
export function currentWeek(now: Date = new Date()): AssessmentWeek | null {
  const iso = todayIso(now);
  return (
    CURRICULUM.find(
      (w) => cmpIso(w.startDate, iso) <= 0 && cmpIso(iso, w.endDate) <= 0,
    ) ?? null
  );
}

/** All assessment weeks that have started on or before `now` (inclusive). */
export function weeksThroughNow(now: Date = new Date()): AssessmentWeek[] {
  const iso = todayIso(now);
  return CURRICULUM.filter((w) => cmpIso(w.startDate, iso) <= 0);
}

/** Categories that have been introduced (recognition weeks) through `now`. */
export function taughtCategories(now: Date = new Date()): WordCategory[] {
  const seen = new Set<WordCategory>();
  for (const w of weeksThroughNow(now)) {
    if (w.type !== "recognition") continue;
    for (const c of w.content) seen.add(c as WordCategory);
  }
  return Array.from(seen);
}

/** Dictation entries introduced (hanzi-by-hanzi) through `now`. */
export function taughtDictation(now: Date = new Date()): DictationEntry[] {
  const iso = todayIso(now);
  return DICTATION.filter((d) => cmpIso(d.weekStart, iso) <= 0);
}

/**
 * The recognition word pool for MCQ / Match rounds: all words from categories
 * the class has covered so far. Before any recognition week has started, we
 * fall back to the full word list so the game stays playable.
 */
export function recognitionPool(now: Date = new Date()): Word[] {
  const cats = new Set(taughtCategories(now));
  if (cats.size === 0) return WORDS.slice();
  return WORDS.filter((w) => cats.has(w.category));
}

/**
 * The writing word pool for Draw rounds: dictation characters taught so far.
 * Falls back to the full word list if nothing has been taught yet (so first-
 * week users still see *something*).
 */
export function drawPool(now: Date = new Date()): Word[] {
  const taught = taughtDictation(now);
  if (taught.length === 0) return WORDS.slice();
  // Prefer Word entries (have proper categories + pinyin); fall back to
  // synthesizing a Word from the dictation entry if the full list doesn't
  // cover it (e.g. particles like 的 that only live in the dictation list).
  const wordByHanzi = new Map(WORDS.map((w) => [w.hanzi, w]));
  return taught.map((d) => {
    const existing = wordByHanzi.get(d.hanzi);
    if (existing) return existing;
    return {
      hanzi: d.hanzi,
      english: d.english,
      pinyin: d.pinyin,
      category: "school" as WordCategory,
      isBonus: d.isBonus,
    };
  });
}

/**
 * Short human-readable summary of the current week, used in the UI header.
 * Example: "This week: opposites" or "This week: writing 我 你 牛 羊..."
 */
export function currentWeekSummary(
  now: Date = new Date(),
): string | null {
  const w = currentWeek(now);
  if (!w) return null;
  if (w.type === "recognition") {
    const labels = w.content.map(prettyCategory).join(" · ");
    return `This week: ${labels}`;
  }
  const chars = w.content.join("");
  return `This week: writing ${chars}`;
}

function prettyCategory(c: string): string {
  return c.replace(/_/g, " ");
}
