import { initialState, type GameState } from "./state";

const STORAGE_KEY = "magical-kitty-mandarin:v1";
const SCHEMA_VERSION = 1;

interface StoredShape {
  version: number;
  state: GameState;
}

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.xp === "number" &&
    Number.isFinite(v.xp) &&
    typeof v.correctCount === "number" &&
    typeof v.incorrectCount === "number" &&
    Array.isArray(v.recentHanzi) &&
    v.recentHanzi.every((h) => typeof h === "string")
  );
}

export function loadState(
  storage: Storage | undefined = globalThis.localStorage,
): GameState {
  if (!storage) return initialState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    if (parsed.version !== SCHEMA_VERSION) return initialState();
    if (!isGameState(parsed.state)) return initialState();
    return parsed.state;
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
