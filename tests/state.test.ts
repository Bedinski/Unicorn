import { describe, expect, it } from "vitest";
import { XP_THRESHOLDS, MAX_LEVEL } from "@/game/levels";
import {
  RECENT_MEMORY,
  initialState,
  recordAnswer,
  resetKitty,
} from "@/game/state";

describe("recordAnswer", () => {
  it("increments xp + correctCount on a correct answer", () => {
    const s0 = initialState();
    const r = recordAnswer(s0, "猫", true);
    expect(r.state.xp).toBe(1);
    expect(r.state.correctCount).toBe(1);
    expect(r.state.incorrectCount).toBe(0);
    expect(r.leveledUp).toBe(false);
  });

  it("does not change xp on a wrong answer but bumps incorrectCount", () => {
    const s0 = initialState();
    const r = recordAnswer(s0, "狗", false);
    expect(r.state.xp).toBe(0);
    expect(r.state.correctCount).toBe(0);
    expect(r.state.incorrectCount).toBe(1);
    expect(r.leveledUp).toBe(false);
  });

  it("sets leveledUp when xp crosses a threshold", () => {
    // 3 correct answers reaches XP=3, threshold for level 2
    let s = initialState();
    let last = recordAnswer(s, "一", true);
    s = last.state;
    last = recordAnswer(s, "二", true);
    s = last.state;
    last = recordAnswer(s, "三", true);
    expect(last.state.xp).toBe(3);
    expect(last.leveledUp).toBe(true);
    expect(last.newLevel).toBe(2);
  });

  it("tracks recent hanzi up to RECENT_MEMORY with newest first", () => {
    let s = initialState();
    const seq = ["猫", "狗", "鱼", "鸟", "山", "水"];
    for (const h of seq) s = recordAnswer(s, h, true).state;
    expect(s.recentHanzi).toHaveLength(RECENT_MEMORY);
    expect(s.recentHanzi[0]).toBe("水");
    expect(s.recentHanzi).toEqual(["水", "山", "鸟", "鱼"]);
  });

  it("caps at MAX_LEVEL and reports justMaxed exactly once", () => {
    const maxXp = XP_THRESHOLDS[MAX_LEVEL - 1];
    // give just enough to hit max on the next correct answer
    let s = { ...initialState(), xp: maxXp - 1 };
    const first = recordAnswer(s, "猫", true);
    expect(first.newLevel).toBe(MAX_LEVEL);
    expect(first.justMaxed).toBe(true);
    const second = recordAnswer(first.state, "狗", true);
    expect(second.newLevel).toBe(MAX_LEVEL);
    expect(second.justMaxed).toBe(false);
  });
});

describe("resetKitty", () => {
  it("zeroes xp and counts but preserves recent hanzi to avoid immediate repeats", () => {
    const base = recordAnswer(initialState(), "猫", true).state;
    const next = recordAnswer(base, "狗", true).state;
    const reset = resetKitty(next);
    expect(reset.xp).toBe(0);
    expect(reset.correctCount).toBe(0);
    expect(reset.incorrectCount).toBe(0);
    expect(reset.recentHanzi).toEqual(next.recentHanzi);
  });
});
