import { initialState, type GameState } from "./state";

const STORAGE_KEY = "magical-kitty-mandarin:v1";
const SCHEMA_VERSION = 3;

interface StoredShape {
  version: number;
  state: Partial<GameState>;
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
    recentHanzi: Array.isArray(partial.recentHanzi)
      ? partial.recentHanzi.filter((h): h is string => typeof h === "string")
      : base.recentHanzi,
    streak: typeof partial.streak === "number" ? partial.streak : base.streak,
    bestStreak:
      typeof partial.bestStreak === "number"
        ? partial.bestStreak
        : base.bestStreak,
    seenHanzi: Array.isArray(partial.seenHanzi)
      ? partial.seenHanzi.filter((h): h is string => typeof h === "string")
      : base.seenHanzi,
    stars:
      partial.stars &&
      typeof partial.stars === "object" &&
      typeof partial.stars.date === "string" &&
      typeof partial.stars.count === "number"
        ? { date: partial.stars.date, count: partial.stars.count }
        : base.stars,
    categoryCorrect:
      partial.categoryCorrect && typeof partial.categoryCorrect === "object"
        ? { ...partial.categoryCorrect }
        : base.categoryCorrect,
    selectedScopeId:
      typeof partial.selectedScopeId === "string"
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
    return mergeWithDefaults(parsed.state);
  } catch {
    return initialState();
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
