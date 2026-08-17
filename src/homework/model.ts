export type HomeworkSkill = "learn" | "write" | "recall";

export interface HomeworkItem {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  skills: readonly HomeworkSkill[];
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  items: readonly HomeworkItem[];
  source: "builtin" | "custom";
  curriculum?: {
    kind: "week" | "category";
    label: string;
    group?: string;
    sequence?: number;
    description?: string;
  };
}

export interface ValidationIssue {
  path: string;
  message: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ALL_SKILLS: readonly HomeworkSkill[] = ["learn", "write", "recall"];

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateAssignment(
  assignment: HomeworkAssignment,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!assignment.id.trim()) {
    issues.push({ path: "id", message: "Assignment id is required." });
  }
  if (!assignment.title.trim()) {
    issues.push({ path: "title", message: "Title is required." });
  }
  if (!isIsoDate(assignment.startDate)) {
    issues.push({ path: "startDate", message: "Start date must be a valid date." });
  }
  if (!isIsoDate(assignment.dueDate)) {
    issues.push({ path: "dueDate", message: "Due date must be a valid date." });
  }
  if (
    isIsoDate(assignment.startDate) &&
    isIsoDate(assignment.dueDate) &&
    assignment.dueDate < assignment.startDate
  ) {
    issues.push({ path: "dueDate", message: "Due date cannot be before the start date." });
  }
  if (assignment.items.length === 0) {
    issues.push({ path: "items", message: "Add at least one character or word." });
  }
  if (assignment.items.length > 120) {
    issues.push({ path: "items", message: "Keep an assignment to 120 items or fewer." });
  }

  const seenHanzi = new Set<string>();
  const seenIds = new Set<string>();
  assignment.items.forEach((item, index) => {
    const path = `items.${index}`;
    if (!item.id.trim()) {
      issues.push({ path: `${path}.id`, message: `Row ${index + 1} needs an item id.` });
    } else if (seenIds.has(item.id)) {
      issues.push({ path: `${path}.id`, message: `Item id ${item.id} appears more than once.` });
    }
    seenIds.add(item.id);
    if (!item.hanzi.trim()) {
      issues.push({ path: `${path}.hanzi`, message: "Hanzi is required." });
    }
    if (!item.pinyin.trim()) {
      issues.push({ path: `${path}.pinyin`, message: `Add pinyin for ${item.hanzi || `row ${index + 1}`}.` });
    }
    if (!item.english.trim()) {
      issues.push({ path: `${path}.english`, message: `Add a meaning for ${item.hanzi || `row ${index + 1}`}.` });
    }
    if (seenHanzi.has(item.hanzi)) {
      issues.push({ path: `${path}.hanzi`, message: `${item.hanzi} appears more than once.` });
    }
    seenHanzi.add(item.hanzi);
    if (item.skills.length === 0) {
      issues.push({ path: `${path}.skills`, message: `${item.hanzi || `Row ${index + 1}`} needs at least one practice skill.` });
    }
    for (const skill of item.skills) {
      if (!ALL_SKILLS.includes(skill)) {
        issues.push({ path: `${path}.skills`, message: `Unknown skill: ${skill}.` });
      }
    }
  });
  return issues;
}

export interface ParsedHomeworkRows {
  items: HomeworkItem[];
  issues: ValidationIssue[];
}

/** Parse one item per line: Hanzi | pinyin | English (tabs and commas also work). */
export function parseHomeworkRows(input: string): ParsedHomeworkRows {
  const items: HomeworkItem[] = [];
  const issues: ValidationIssue[] = [];
  const lines = input.split(/\r?\n/);

  lines.forEach((raw, lineIndex) => {
    const line = raw.trim();
    if (!line) return;
    const delimiter = line.includes("\t") ? "\t" : line.includes("|") ? "|" : ",";
    const parts = line.split(delimiter).map((part) => part.trim());
    if (parts.length < 3) {
      issues.push({
        path: `line.${lineIndex + 1}`,
        message: `Line ${lineIndex + 1} needs Hanzi, pinyin, and English meaning.`,
      });
      return;
    }
    const [hanzi, pinyin, ...englishParts] = parts;
    const english = englishParts.join(delimiter === "," ? ", " : " ").trim();
    items.push({
      id: hanzi,
      hanzi,
      pinyin,
      english,
      skills: ALL_SKILLS.slice(),
    });
  });

  return { items, issues };
}

export function customAssignmentId(startDate: string, title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36) || "homework";
  return `custom:${startDate}:${slug}`;
}
