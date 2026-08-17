import { describe, expect, it } from "vitest";
import { XP_THRESHOLDS, MAX_LEVEL } from "@/game/levels";
import {
  DAILY_STAR_GOAL,
  RECENT_MEMORY,
  STICKER_THRESHOLD,
  earnedStickers,
  initialState,
  recordAnswer,
  resetKitty,
  todayIso,
} from "@/game/state";

describe("recordAnswer base behavior", () => {
  it("increments xp + correctCount on a correct answer", () => {
    const s0 = initialState();
    const r = recordAnswer(s0, "貓", true);
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

  it("tracks recent hanzi up to RECENT_MEMORY with newest first", () => {
    let s = initialState();
    const seq = ["貓", "狗", "魚", "羊", "山", "水"];
    for (const h of seq) s = recordAnswer(s, h, true).state;
    expect(s.recentHanzi).toHaveLength(RECENT_MEMORY);
    expect(s.recentHanzi[0]).toBe("水");
    expect(s.recentHanzi).toEqual(["水", "山", "羊", "魚"]);
  });

  it("caps at MAX_LEVEL and reports justMaxed exactly once", () => {
    const maxXp = XP_THRESHOLDS[MAX_LEVEL - 1];
    let s = { ...initialState(), xp: maxXp - 1 };
    const first = recordAnswer(s, "貓", true);
    expect(first.newLevel).toBe(MAX_LEVEL);
    expect(first.justMaxed).toBe(true);
    const second = recordAnswer(first.state, "狗", true);
    expect(second.newLevel).toBe(MAX_LEVEL);
    expect(second.justMaxed).toBe(false);
  });
});

describe("streak", () => {
  it("increments on correct answers and resets on wrong", () => {
    let s = initialState();
    s = recordAnswer(s, "貓", true).state;
    expect(s.streak).toBe(1);
    s = recordAnswer(s, "狗", true).state;
    expect(s.streak).toBe(2);
    s = recordAnswer(s, "魚", false).state;
    expect(s.streak).toBe(0);
    s = recordAnswer(s, "羊", true).state;
    expect(s.streak).toBe(1);
  });

  it("tracks bestStreak as the max streak ever reached", () => {
    let s = initialState();
    for (const h of ["貓", "狗", "魚"]) {
      s = recordAnswer(s, h, true).state;
    }
    expect(s.bestStreak).toBe(3);
    s = recordAnswer(s, "羊", false).state;
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(3);
  });

  it("awards bonus XP at streak milestones (3, 5, 10)", () => {
    let s = initialState();
    // streak 1, 2 — no bonus
    const r1 = recordAnswer(s, "一", true);
    s = r1.state;
    expect(r1.bonusXp).toBe(0);
    const r2 = recordAnswer(s, "二", true);
    s = r2.state;
    expect(r2.bonusXp).toBe(0);
    // streak 3 — milestone, +1 bonus
    const r3 = recordAnswer(s, "三", true);
    s = r3.state;
    expect(r3.streakMilestone).toBe(3);
    expect(r3.bonusXp).toBe(1);
    expect(s.xp).toBe(4); // 3 base + 1 bonus
    // streak 4 — no bonus
    const r4 = recordAnswer(s, "四", true);
    s = r4.state;
    expect(r4.bonusXp).toBe(0);
    // streak 5 — milestone, +2 bonus
    const r5 = recordAnswer(s, "五", true);
    s = r5.state;
    expect(r5.streakMilestone).toBe(5);
    expect(r5.bonusXp).toBe(2);
  });
});

describe("seen words (NEW badge)", () => {
  it("flags the first encounter as new and tracks it thereafter", () => {
    let s = initialState();
    const first = recordAnswer(s, "貓", true);
    expect(first.wasNewWord).toBe(true);
    s = first.state;
    expect(s.seenHanzi).toContain("貓");
    const second = recordAnswer(s, "貓", true);
    expect(second.wasNewWord).toBe(false);
  });

  it("counts wrong-answer encounters as seen too", () => {
    const r = recordAnswer(initialState(), "狗", false);
    expect(r.wasNewWord).toBe(true);
    expect(r.state.seenHanzi).toContain("狗");
  });
});

describe("daily stars", () => {
  it("increments today's star count on correct answers", () => {
    const now = new Date("2026-04-20T10:00:00");
    let s = initialState();
    s.stars = { date: todayIso(now), count: 0 };
    s = recordAnswer(s, "貓", true, now).state;
    expect(s.stars.count).toBe(1);
    s = recordAnswer(s, "狗", true, now).state;
    expect(s.stars.count).toBe(2);
  });

  it("does not increment stars on a wrong answer", () => {
    const now = new Date("2026-04-20T10:00:00");
    const s0 = { ...initialState(), stars: { date: todayIso(now), count: 3 } };
    const r = recordAnswer(s0, "貓", false, now);
    expect(r.state.stars.count).toBe(3);
  });

  it("rolls the counter over when the date changes", () => {
    const yesterday = new Date("2026-04-19T23:59:00");
    const today = new Date("2026-04-20T00:05:00");
    const s0 = {
      ...initialState(),
      stars: { date: todayIso(yesterday), count: 7 },
    };
    const r = recordAnswer(s0, "貓", true, today);
    expect(r.state.stars.date).toBe(todayIso(today));
    expect(r.state.stars.count).toBe(1);
  });

  it("fires dailyGoalHit exactly when crossing the goal threshold", () => {
    const now = new Date("2026-04-20T10:00:00");
    let s = {
      ...initialState(),
      stars: { date: todayIso(now), count: DAILY_STAR_GOAL - 1 },
    };
    const hitting = recordAnswer(s, "貓", true, now);
    expect(hitting.dailyGoalHit).toBe(true);
    s = hitting.state;
    const after = recordAnswer(s, "狗", true, now);
    expect(after.dailyGoalHit).toBe(false);
  });
});

describe("category stickers", () => {
  it("does not count weekly-only writing characters toward the master dictation sticker", () => {
    const result = recordAnswer(initialState(), "學", true);
    expect(result.state.categoryCorrect.dictation).toBeUndefined();
  });

  it("credits an explicitly selected category when a word belongs to multiple packs", () => {
    const result = recordAnswer(initialState(), "名字", true, new Date(), "meizhou-1");
    expect(result.state.categoryCorrect["meizhou-1"]).toBe(1);
    expect(result.state.categoryCorrect["hfw-misc"]).toBeUndefined();
  });

  it("awards a sticker when a category hits the threshold of correct answers", () => {
    let s = initialState();
    const animals = ["大象", "蛇", "鼠", "虎", "雞"];
    let newSticker: string | null = null;
    for (const h of animals) {
      const r = recordAnswer(s, h, true);
      s = r.state;
      if (r.newSticker) newSticker = r.newSticker;
    }
    expect(s.categoryCorrect["hfw-animals"]).toBe(STICKER_THRESHOLD);
    expect(newSticker).toBe("hfw-animals");
    expect(earnedStickers(s)).toContain("hfw-animals");
  });

  it("does not re-award a sticker after further correct answers", () => {
    let s = initialState();
    const animals = ["大象", "蛇", "鼠", "虎", "雞", "鳥"];
    const stickerEvents: string[] = [];
    for (const h of animals) {
      const r = recordAnswer(s, h, true);
      s = r.state;
      if (r.newSticker) stickerEvents.push(r.newSticker);
    }
    expect(stickerEvents).toEqual(["hfw-animals"]);
  });

  it("wrong answers do not progress a category", () => {
    const s0 = initialState();
    const r = recordAnswer(s0, "大象", false);
    expect(r.state.categoryCorrect["hfw-animals"]).toBeUndefined();
  });
});

describe("resetKitty", () => {
  it("zeroes xp and per-round counts but preserves persistent progress", () => {
    let s = initialState();
    for (const h of ["貓", "狗", "魚", "羊", "馬"]) {
      s = recordAnswer(s, h, true).state;
    }
    s = { ...s, selectedScopeId: "week-08" };
    const reset = resetKitty(s);
    expect(reset.xp).toBe(0);
    expect(reset.correctCount).toBe(0);
    expect(reset.incorrectCount).toBe(0);
    expect(reset.streak).toBe(0);
    // preserved
    expect(reset.seenHanzi).toEqual(s.seenHanzi);
    expect(reset.stars).toEqual(s.stars);
    expect(reset.categoryCorrect).toEqual(s.categoryCorrect);
    expect(reset.bestStreak).toBe(s.bestStreak);
    expect(reset.recentHanzi).toEqual(s.recentHanzi);
    expect(reset.selectedScopeId).toBe("week-08");
  });
});

describe("selectedScopeId", () => {
  it("defaults to null", () => {
    expect(initialState().selectedScopeId).toBeNull();
  });
});

describe("teacherMode", () => {
  it("defaults to false", () => {
    expect(initialState().teacherMode).toBe(false);
  });

  it("is preserved through recordAnswer", () => {
    const s0 = { ...initialState(), teacherMode: true };
    const r = recordAnswer(s0, "貓", true);
    expect(r.state.teacherMode).toBe(true);
  });

  it("is preserved through resetKitty", () => {
    const s = { ...initialState(), teacherMode: true };
    expect(resetKitty(s).teacherMode).toBe(true);
  });
});
