import {
  FIRST_GRADE_WORDS,
  STUDY_CATEGORIES,
  type FirstGradeWord,
  type StudyCategoryId,
} from "./firstGrade";

export type WordCategory = StudyCategoryId;
export type Word = FirstGradeWord;

/** Complete, deduplicated First Grade vocabulary catalog. */
export const WORDS: readonly Word[] = FIRST_GRADE_WORDS;

export const CATEGORY_LABELS = Object.fromEntries(
  STUDY_CATEGORIES.map((definition) => [definition.id, definition.label]),
) as Record<WordCategory, string>;
