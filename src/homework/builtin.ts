import { CURRICULUM } from "@/data/curriculum";
import { DICTATION } from "@/data/dictation";
import { WORDS, type WordCategory } from "@/data/words";
import type { HomeworkAssignment, HomeworkItem } from "./model";

const dictationByHanzi = new Map(DICTATION.map((entry) => [entry.hanzi, entry]));

function dictationItems(content: readonly string[]): HomeworkItem[] {
  return content.map((hanzi) => {
    // Dictation metadata deliberately wins over the broader vocabulary catalog.
    const entry = dictationByHanzi.get(hanzi);
    return {
      id: hanzi,
      hanzi,
      pinyin: entry?.pinyin ?? "",
      english: entry?.english ?? "",
      skills: ["learn", "write", "recall"],
    };
  });
}

function recognitionItems(content: readonly string[]): HomeworkItem[] {
  const categories = new Set(content as WordCategory[]);
  return WORDS.filter((word) => categories.has(word.category)).map((word) => ({
    id: word.hanzi,
    hanzi: word.hanzi,
    pinyin: word.pinyin,
    english: word.english,
    skills: ["learn", "write", "recall"],
  }));
}

export const BUILTIN_ASSIGNMENTS: readonly HomeworkAssignment[] = CURRICULUM.map(
  (week) => ({
    id: `builtin:${week.startDate}`,
    title: week.type === "dictation" ? "Writing & Dictation" : "Character Recognition",
    startDate: week.startDate,
    dueDate: week.endDate,
    items: week.type === "dictation" ? dictationItems(week.content) : recognitionItems(week.content),
    source: "builtin",
  }),
);
