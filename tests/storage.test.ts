import { beforeEach, describe, expect, it } from "vitest";
import { initialState, recordAnswer } from "@/game/state";
import { clearState, loadState, saveState } from "@/game/storage";

function makeMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    key: (i: number) => Array.from(data.keys())[i] ?? null,
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  } as Storage;
}

describe("storage", () => {
  let storage: Storage;
  beforeEach(() => {
    storage = makeMemoryStorage();
  });

  it("returns an initial state when nothing is stored", () => {
    expect(loadState(storage)).toEqual(initialState());
  });

  it("round-trips a saved state", () => {
    const base = recordAnswer(initialState(), "貓", true).state;
    saveState(base, storage);
    expect(loadState(storage)).toEqual(base);
  });

  it("recovers to initial state when the stored JSON is corrupted", () => {
    storage.setItem("magical-kitty-mandarin:v1", "{not json");
    expect(loadState(storage)).toEqual(initialState());
  });

  it("recovers to initial state on schema version mismatch", () => {
    storage.setItem(
      "magical-kitty-mandarin:v1",
      JSON.stringify({ version: 999, state: initialState() }),
    );
    expect(loadState(storage)).toEqual(initialState());
  });

  it("archives and removes legacy vocabulary, categories, and scopes during migration", () => {
    const legacyRaw = JSON.stringify({
      version: 3,
      state: {
        ...initialState(),
        xp: 12,
        recentHanzi: ["你好", "東"],
        seenHanzi: ["耳朵", "東"],
        categoryCorrect: { greetings: 99, "hfw-weather": 2 },
        selectedScopeId: "2026-02-09",
      },
    });
    storage.setItem("magical-kitty-mandarin:v1", legacyRaw);

    const migrated = loadState(storage);

    expect(migrated.xp).toBe(12);
    expect(migrated.recentHanzi).toEqual(["東"]);
    expect(migrated.seenHanzi).toEqual(["東"]);
    expect(migrated.categoryCorrect).toEqual({ "hfw-weather": 2 });
    expect(migrated.selectedScopeId).toBeNull();
    expect(storage.getItem("magical-kitty-mandarin:archive:pre-first-grade:game-state:v1"))
      .toBe(legacyRaw);
    expect(JSON.parse(storage.getItem("magical-kitty-mandarin:v1")!).version).toBe(4);
  });

  it("recovers to initial state when stored state shape is invalid", () => {
    storage.setItem(
      "magical-kitty-mandarin:v1",
      JSON.stringify({ version: 1, state: { xp: "lots" } }),
    );
    expect(loadState(storage)).toEqual(initialState());
  });

  it("clearState removes the saved key", () => {
    saveState(initialState(), storage);
    clearState(storage);
    expect(storage.getItem("magical-kitty-mandarin:v1")).toBeNull();
  });

  it("is a no-op when storage is missing", () => {
    expect(() => saveState(initialState(), undefined)).not.toThrow();
    expect(loadState(undefined)).toEqual(initialState());
    expect(() => clearState(undefined)).not.toThrow();
  });
});
