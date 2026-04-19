import { describe, expect, it } from "vitest";
import { WORDS } from "@/data/words";
import { buildRound } from "@/game/rounds";
import {
  initialState,
  recordAnswer,
  type GameState,
} from "@/game/state";
import { MAX_LEVEL, levelForXp, XP_THRESHOLDS } from "@/game/levels";
import { loadState, saveState } from "@/game/storage";

function memoryStorage(): Storage {
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

describe("end-to-end gameplay loop", () => {
  it("playing correctly progresses the kitty all the way to max level", () => {
    const storage = memoryStorage();
    let state: GameState = loadState(storage);
    expect(levelForXp(state.xp)).toBe(1);

    const rng = (() => {
      let s = 12345;
      return () => {
        s = (s * 1664525 + 1013904223) % 2 ** 32;
        return s / 2 ** 32;
      };
    })();

    const targetXp = XP_THRESHOLDS[MAX_LEVEL - 1];
    let safety = targetXp * 2 + 10;

    while (levelForXp(state.xp) < MAX_LEVEL && safety-- > 0) {
      const round = buildRound(WORDS, state.recentHanzi, rng);
      const result = recordAnswer(state, round.answer.hanzi, true);
      state = result.state;
      saveState(state, storage);
    }

    expect(levelForXp(state.xp)).toBe(MAX_LEVEL);
    expect(state.xp).toBeGreaterThanOrEqual(targetXp);

    const reloaded = loadState(storage);
    expect(reloaded.xp).toBe(state.xp);
  });

  it("a mix of right and wrong answers still progresses, and wrong answers do not demote level", () => {
    let state = initialState();
    const rng = Math.random;
    let lastLevel = 1;
    const outcomes: boolean[] = [
      true, true, false, true, true, true, false, true, true, true,
    ];
    for (const correct of outcomes) {
      const round = buildRound(WORDS, state.recentHanzi, rng);
      const result = recordAnswer(state, round.answer.hanzi, correct);
      state = result.state;
      expect(levelForXp(state.xp)).toBeGreaterThanOrEqual(lastLevel);
      lastLevel = levelForXp(state.xp);
    }
    expect(state.correctCount).toBe(8);
    expect(state.incorrectCount).toBe(2);
    expect(state.xp).toBe(8);
  });
});
