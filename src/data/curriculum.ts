import {
  FIRST_GRADE_WEEKS,
  STUDY_CATEGORIES,
  type FirstGradeWeek,
  type StudyCategoryDefinition,
} from "./firstGrade";

export type StudyScope =
  | { id: string; kind: "week"; label: string; description: string; week: FirstGradeWeek }
  | { id: string; kind: "category"; label: string; description: string; category: StudyCategoryDefinition };

export const WEEK_SCOPES: readonly StudyScope[] = FIRST_GRADE_WEEKS.map((week) => ({
  id: week.id,
  kind: "week" as const,
  label: `Week ${week.number}: ${week.title}`,
  description: week.description,
  week,
}));

export const CATEGORY_SCOPES: readonly StudyScope[] = STUDY_CATEGORIES.map((category) => ({
  id: `category:${category.id}`,
  kind: "category" as const,
  label: category.label,
  description: `${category.group} practice`,
  category,
}));

/** All date-independent First Grade practice choices. */
export const STUDY_SCOPES: readonly StudyScope[] = [...WEEK_SCOPES, ...CATEGORY_SCOPES];
