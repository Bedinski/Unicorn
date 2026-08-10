import { BUILTIN_ASSIGNMENTS } from "./builtin";
import { validateAssignment, type HomeworkAssignment } from "./model";

const CUSTOM_ASSIGNMENTS_KEY = "magical-kitty-mandarin:homework-assignments:v1";

interface StoredAssignments {
  version: 1;
  assignments: HomeworkAssignment[];
}

export class HomeworkRepository {
  constructor(private readonly storage: Storage | undefined = availableStorage()) {}

  list(): HomeworkAssignment[] {
    return [...BUILTIN_ASSIGNMENTS, ...this.loadCustom()].sort((a, b) =>
      b.startDate.localeCompare(a.startDate),
    );
  }

  find(id: string): HomeworkAssignment | null {
    return this.list().find((assignment) => assignment.id === id) ?? null;
  }

  saveCustom(assignment: HomeworkAssignment): void {
    if (assignment.source !== "custom") {
      throw new Error("Only custom assignments can be saved.");
    }
    if (!assignment.id.startsWith("custom:") || BUILTIN_ASSIGNMENTS.some((item) => item.id === assignment.id)) {
      throw new Error("Custom assignments need a unique custom id.");
    }
    const issues = validateAssignment(assignment);
    if (issues.length > 0) {
      throw new Error(issues.map((issue) => issue.message).join(" "));
    }
    const assignments = this.loadCustom();
    const index = assignments.findIndex((item) => item.id === assignment.id);
    if (index >= 0) assignments[index] = assignment;
    else assignments.push(assignment);
    if (!this.write({ version: 1, assignments })) {
      throw new Error("This browser could not save homework. Check that browser storage is enabled and try again.");
    }
  }

  deleteCustom(id: string): void {
    if (!this.write({
      version: 1,
      assignments: this.loadCustom().filter((assignment) => assignment.id !== id),
    })) {
      throw new Error("This browser could not delete the homework. Check that browser storage is enabled and try again.");
    }
  }

  private loadCustom(): HomeworkAssignment[] {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(CUSTOM_ASSIGNMENTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Partial<StoredAssignments>;
      if (parsed.version !== 1 || !Array.isArray(parsed.assignments)) return [];
      return parsed.assignments.filter(isStoredCustomAssignment);
    } catch {
      return [];
    }
  }

  private write(payload: StoredAssignments): boolean {
    if (!this.storage) return false;
    try {
      this.storage.setItem(CUSTOM_ASSIGNMENTS_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }
}

function availableStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function isStoredCustomAssignment(value: unknown): value is HomeworkAssignment {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<HomeworkAssignment>;
  if (
    candidate.source !== "custom" ||
    typeof candidate.id !== "string" ||
    !candidate.id.startsWith("custom:") ||
    typeof candidate.title !== "string" ||
    typeof candidate.startDate !== "string" ||
    typeof candidate.dueDate !== "string" ||
    !Array.isArray(candidate.items)
  ) return false;
  if (!candidate.items.every((item) =>
    Boolean(item) &&
    typeof item.id === "string" &&
    typeof item.hanzi === "string" &&
    typeof item.pinyin === "string" &&
    typeof item.english === "string" &&
    Array.isArray(item.skills)
  )) return false;
  try {
    return validateAssignment(candidate as HomeworkAssignment).length === 0;
  } catch {
    return false;
  }
}

export function recommendedAssignment(
  assignments: readonly HomeworkAssignment[],
  today: string,
): HomeworkAssignment | null {
  if (assignments.length === 0) return null;
  const active = assignments
    .filter((assignment) => assignment.startDate <= today && today <= assignment.dueDate)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  if (active) return active;
  return (
    assignments
      .filter((assignment) => assignment.startDate <= today)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ??
    assignments.slice().sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  );
}
