import { initialState, type GameState } from "./state";
import { FIRST_GRADE_WORDS, FIRST_GRADE_WEEKS, STUDY_CATEGORIES } from "@/data/firstGrade";

const STORAGE_KEY = "magical-kitty-mandarin:v1";
const LEGACY_ARCHIVE_KEY = "magical-kitty-mandarin:archive:pre-first-grade:game-state:v1";
const SCHEMA_VERSION = 4;

const FIRST_GRADE_HANZI: ReadonlySet<string> = new Set(FIRST_GRADE_WORDS.map((word) => word.hanzi));
const FIRST_GRADE_CATEGORY_IDS: ReadonlySet<string> = new Set(STUDY_CATEGORIES.map((category) => category.id));
const FIRST_GRADE_SCOPE_IDS: ReadonlySet<string> = new Set([
  ...FIRST_GRADE_WEEKS.map((week) => week.id),
  ...STUDY_CATEGORIES.map((category) => `category:${category.id}`),
]);

interface StoredShape {
  version: number;
  state: Partial<GameState>;
}

function currentHanzi(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((hanzi): hanzi is string => typeof hanzi === "string" && FIRST_GRADE_HANZI.has(hanzi))
    : [];
}

function currentCategoryCorrect(value: unknown): GameState["categoryCorrect"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([id, count]) =>
    FIRST_GRADE_CATEGORY_IDS.has(id) &&
    typeof count === "number" &&
    Number.isFinite(count) &&
    count >= 0,
  ));
}

function mergeWithDefaults(partial: Partial<GameState> & { selectedWeekStart?: unknown }): GameState {
  const base = initialState();
  const merged: GameState = {
    xp: typeof partial.xp === "number" ? partial.xp : base.xp,
    correctCount:
      typeof partial.correctCount === "number"
        ? partial.correctCount
        : base.correctCount,
    incorrectCount:
      typeof partial.incorrectCount === "number"
        ? partial.incorrectCount
        : base.incorrectCount,
    recentHanzi: currentHanzi(partial.recentHanzi),
    streak: typeof partial.streak === "number" ? partial.streak : base.streak,
    bestStreak:
      typeof partial.bestStreak === "number"
        ? partial.bestStreak
        : base.bestStreak,
    seenHanzi: currentHanzi(partial.seenHanzi),
    stars:
      partial.stars &&
      typeof partial.stars === "object" &&
      typeof partial.stars.date === "string" &&
      typeof partial.stars.count === "number"
        ? { date: partial.stars.date, count: partial.stars.count }
        : base.stars,
    categoryCorrect: currentCategoryCorrect(partial.categoryCorrect),
    selectedScopeId:
      typeof partial.selectedScopeId === "string" && FIRST_GRADE_SCOPE_IDS.has(partial.selectedScopeId)
        ? partial.selectedScopeId
        : base.selectedScopeId,
    teacherMode:
      typeof partial.teacherMode === "boolean"
        ? partial.teacherMode
        : base.teacherMode,
  };
  return merged;
}

export function loadState(
  storage: Storage | undefined = globalThis.localStorage,
): GameState {
  if (!storage) return initialState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    // Unknown future versions reset; older versions (1) merge-forward.
    if (typeof parsed.version !== "number" || parsed.version > SCHEMA_VERSION) {
      return initialState();
    }
    if (!parsed.state || typeof parsed.state !== "object") {
      return initialState();
    }
    const state = mergeWithDefaults(parsed.state);
    if (parsed.version < SCHEMA_VERSION) {
      if (archiveLegacyValue(storage, raw)) saveState(state, storage);
    }
    return state;
  } catch {
    return initialState();
  }
}

function archiveLegacyValue(storage: Storage, raw: string): boolean {
  try {
    if (storage.getItem(LEGACY_ARCHIVE_KEY) === null) {
      storage.setItem(LEGACY_ARCHIVE_KEY, raw);
    }
    return storage.getItem(LEGACY_ARCHIVE_KEY) !== null;
  } catch {
    // Keep the active legacy payload untouched so archiving can retry later.
    return false;
  }
}

export function saveState(
  state: GameState,
  storage: Storage | undefined = globalThis.localStorage,
): void {
  if (!storage) return;
  try {
    const payload: StoredShape = { version: SCHEMA_VERSION, state };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage full or disabled — silently ignore
  }
}

export function clearState(
  storage: Storage | undefined = globalThis.localStorage,
): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
