import { FIRST_GRADE_WEEKS, STUDY_CATEGORIES, wordsForCategory, wordsForWeek } from "@/data/firstGrade";
import type { HomeworkAssignment, HomeworkItem } from "./model";

function items(words: ReturnType<typeof wordsForCategory>): HomeworkItem[] {
  return words.map(({ hanzi, pinyin, english }) => ({
    id: hanzi,
    hanzi,
    pinyin,
    english,
    skills: ["learn", "write", "recall"],
  }));
}

const weekAssignments: HomeworkAssignment[] = FIRST_GRADE_WEEKS.map((week) => ({
  id: `builtin:first-grade-v2:${week.id}`,
  title: `Week ${week.number}: ${week.title}`,
  startDate: "2000-01-01",
  dueDate: "2099-12-31",
  items: items(wordsForWeek(week)),
  source: "builtin",
  curriculum: {
    kind: "week",
    label: `Week ${week.number}`,
    sequence: week.number,
    description: week.description,
  },
}));

const categoryAssignments: HomeworkAssignment[] = STUDY_CATEGORIES.map((category) => ({
  id: `builtin:first-grade-v2:category:${category.id}`,
  title: category.label,
  startDate: "2000-01-01",
  dueDate: "2099-12-31",
  items: items(wordsForCategory(category.id)),
  source: "builtin",
  curriculum: {
    kind: "category",
    label: category.label,
    group: category.group,
    description: `${category.group} practice`,
  },
}));

export const BUILTIN_ASSIGNMENTS: readonly HomeworkAssignment[] = [
  ...weekAssignments,
  ...categoryAssignments,
];
