import type { WordCategory } from "./words";

export type AssessmentType = "dictation" | "recognition";

export interface AssessmentWeek {
  startDate: string; // YYYY-MM-DD (inclusive)
  endDate: string; // YYYY-MM-DD (inclusive)
  type: AssessmentType;
  /**
   * For "dictation" weeks: list of hanzi being introduced that week.
   * For "recognition" weeks: list of WordCategory keys.
   */
  content: readonly string[];
}

export const CURRICULUM: readonly AssessmentWeek[] = [
  { startDate: "2026-02-09", endDate: "2026-02-13", type: "dictation",
    content: ["大", "小", "日", "月", "上", "下", "左", "右"] },
  { startDate: "2026-02-17", endDate: "2026-02-20", type: "recognition",
    content: ["numbers", "dates", "colors"] satisfies WordCategory[] },
  { startDate: "2026-02-23", endDate: "2026-02-27", type: "dictation",
    content: ["中", "水", "天", "人", "木", "口", "山", "土"] },
  { startDate: "2026-03-02", endDate: "2026-03-06", type: "recognition",
    content: ["family", "places"] satisfies WordCategory[] },
  { startDate: "2026-03-09", endDate: "2026-03-13", type: "dictation",
    content: ["女", "好", "火", "石", "的", "是", "田", "力"] },
  { startDate: "2026-03-16", endDate: "2026-03-20", type: "recognition",
    content: ["pronouns", "animals", "pointing"] satisfies WordCategory[] },
  { startDate: "2026-03-23", endDate: "2026-03-26", type: "dictation",
    content: ["耳", "門", "心", "子", "可", "以", "白", "不"] },
  { startDate: "2026-04-06", endDate: "2026-04-10", type: "recognition",
    content: ["school", "weather"] satisfies WordCategory[] },
  { startDate: "2026-04-13", endDate: "2026-04-17", type: "dictation",
    content: ["我", "你", "牛", "羊", "兔", "狗", "吃"] },
  { startDate: "2026-04-20", endDate: "2026-04-23", type: "recognition",
    content: ["opposites"] satisfies WordCategory[] },
  { startDate: "2026-04-27", endDate: "2026-05-01", type: "dictation",
    content: ["去", "要", "有", "看", "玩", "會", "年"] },
  { startDate: "2026-05-04", endDate: "2026-05-08", type: "recognition",
    content: ["verbs", "feelings", "classroom"] satisfies WordCategory[] },
  { startDate: "2026-05-11", endDate: "2026-05-15", type: "dictation",
    content: ["文", "早", "這是", "今天", "明天", "朋友"] },
  { startDate: "2026-05-18", endDate: "2026-05-22", type: "recognition",
    content: ["senses", "body_parts", "greetings"] satisfies WordCategory[] },
];
