import { wordsForCategory } from "./firstGrade";

export interface DictationEntry {
  hanzi: string;
  english: string;
  pinyin: string;
}

/** Date-independent writing list assembled from the First Grade source pack. */
export const DICTATION: readonly DictationEntry[] = wordsForCategory("dictation").map(
  ({ hanzi, english, pinyin }) => ({ hanzi, english, pinyin }),
);
