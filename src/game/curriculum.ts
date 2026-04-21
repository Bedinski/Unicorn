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

/** Look up a curriculum week by its startDate (ISO). */
export function weekByStart(startDate: string): AssessmentWeek | null {
  return CURRICULUM.find((w) => w.startDate === startDate) ?? null;
}

/** Short human label for the selector, e.g. "Apr 20 · Opposites" or
 *  "Apr 13 · 我 你 牛 羊 兔 狗 吃". */
export function weekLabel(week: AssessmentWeek): string {
  const date = shortDate(week.startDate);
  if (week.type === "recognition") {
    const cats = week.content.map(prettyCategory).join(" · ");
    return `${date} · ${titleCase(cats)}`;
  }
  return `${date} · ${week.content.join(" ")}`;
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[m - 1]} ${d}`;
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((t) => (t ? t[0].toUpperCase() + t.slice(1) : t))
    .join(" ");
}

/**
 * Compute the recognition + draw pools for a specific week, used when the
 * player narrows practice to one week ("test prep" mode). For recognition
 * weeks (categories), both pools draw from the vocabulary in those
 * categories. For dictation weeks (specific characters), both pools draw
 * from the listed characters — using the matching Word entry when one
 * exists, otherwise synthesizing one from the DictationEntry so the round
 * still has english + pinyin.
 */
export function poolsForWeek(week: AssessmentWeek): {
  recognitionPool: Word[];
  drawPool: Word[];
} {
  if (week.type === "recognition") {
    const cats = new Set(week.content as WordCategory[]);
    const recog = WORDS.filter((w) => cats.has(w.category));
    // Draw pool during a recognition week prefers single-character words so
    // kids have something concrete to write; compound words fall back only if
    // there aren't enough singles to build rounds.
    const singles = recog.filter((w) => [...w.hanzi].length === 1);
    const drawPool = singles.length >= 3 ? singles : recog;
    return { recognitionPool: recog, drawPool };
  }
  // Dictation week: content is a list of specific hanzi strings.
  const wordByHanzi = new Map(WORDS.map((w) => [w.hanzi, w]));
  const dictByHanzi = new Map(DICTATION.map((d) => [d.hanzi, d]));
  const pool: Word[] = week.content.map((h) => {
    const w = wordByHanzi.get(h);
    if (w) return w;
    const d = dictByHanzi.get(h) as DictationEntry | undefined;
    return {
      hanzi: h,
      english: d?.english ?? h,
      pinyin: d?.pinyin ?? "",
      category: "school" as WordCategory,
      isBonus: d?.isBonus,
    };
  });
  return { recognitionPool: pool, drawPool: pool };
}
