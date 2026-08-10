import type { HomeworkAssignment } from "./model";
import type { HomeworkSession } from "./session";

const PROGRESS_KEY = "magical-kitty-mandarin:homework-progress:v1";

export interface ItemProgress {
  learned: boolean;
  writingPractices: number;
  recallCorrect: number;
  recallIncorrect: number;
  lastPracticed: string;
}

export interface AssignmentProgress {
  items: Record<string, ItemProgress>;
  completedAt: string | null;
  missionsCompleted: number;
}

interface ProgressPayload {
  version: 1;
  assignments: Record<string, AssignmentProgress>;
  session: HomeworkSession | null;
}

function initialPayload(): ProgressPayload {
  return { version: 1, assignments: {}, session: null };
}

const SESSION_PHASES = new Set(["learn", "practice", "recall", "review", "complete"]);

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeItemProgress(value: unknown): ItemProgress | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<ItemProgress>;
  return {
    learned: item.learned === true,
    writingPractices: nonNegativeInteger(item.writingPractices),
    recallCorrect: nonNegativeInteger(item.recallCorrect),
    recallIncorrect: nonNegativeInteger(item.recallIncorrect),
    lastPracticed: typeof item.lastPracticed === "string" ? item.lastPracticed : "",
  };
}

function normalizeAssignmentProgress(value: unknown): AssignmentProgress | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<AssignmentProgress>;
  const items: Record<string, ItemProgress> = {};
  if (candidate.items && typeof candidate.items === "object" && !Array.isArray(candidate.items)) {
    for (const [id, rawItem] of Object.entries(candidate.items)) {
      const item = normalizeItemProgress(rawItem);
      if (item) items[id] = item;
    }
  }
  return {
    items,
    completedAt: typeof candidate.completedAt === "string" ? candidate.completedAt : null,
    missionsCompleted: nonNegativeInteger(candidate.missionsCompleted),
  };
}

function normalizeSession(value: unknown): HomeworkSession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Partial<HomeworkSession>;
  if (
    session.version !== 1 ||
    typeof session.assignmentId !== "string" ||
    !SESSION_PHASES.has(session.phase ?? "") ||
    !Array.isArray(session.queue) ||
    !session.queue.every((item) => typeof item === "string") ||
    typeof session.position !== "number" ||
    !Number.isInteger(session.position) ||
    session.position < 0
  ) return null;
  if (
    (session.phase === "complete" && session.queue.length !== 0) ||
    (session.phase !== "complete" && session.position >= session.queue.length)
  ) return null;
  const reviewAttempts: Record<string, number> = {};
  if (session.reviewAttempts && typeof session.reviewAttempts === "object") {
    for (const [id, attempts] of Object.entries(session.reviewAttempts)) {
      reviewAttempts[id] = nonNegativeInteger(attempts);
    }
  }
  return {
    version: 1,
    assignmentId: session.assignmentId,
    missionItemIds: stringArray(session.missionItemIds).length > 0
      ? stringArray(session.missionItemIds)
      : [...new Set([...session.queue, ...stringArray(session.missed), ...stringArray(session.needsWork)])],
    phase: session.phase!,
    queue: session.queue,
    position: session.position,
    missed: stringArray(session.missed),
    needsWork: stringArray(session.needsWork),
    reviewAttempts,
  };
}

export class HomeworkProgressStore {
  constructor(private readonly storage: Storage | undefined = availableStorage()) {}

  getAssignment(id: string): AssignmentProgress {
    return this.read().assignments[id] ?? { items: {}, completedAt: null, missionsCompleted: 0 };
  }

  getTotalMissionsCompleted(): number {
    return Object.values(this.read().assignments)
      .reduce((total, assignment) => total + assignment.missionsCompleted, 0);
  }

  recordLearned(assignmentId: string, itemId: string, now = new Date()): void {
    this.updateItem(assignmentId, itemId, now, (item) => ({ ...item, learned: true }));
  }

  recordWriting(assignmentId: string, itemId: string, now = new Date()): void {
    this.updateItem(assignmentId, itemId, now, (item) => ({
      ...item,
      writingPractices: item.writingPractices + 1,
    }));
  }

  recordRecall(assignmentId: string, itemId: string, correct: boolean, now = new Date()): void {
    this.updateItem(assignmentId, itemId, now, (item) => ({
      ...item,
      recallCorrect: item.recallCorrect + (correct ? 1 : 0),
      recallIncorrect: item.recallIncorrect + (correct ? 0 : 1),
    }));
  }

  complete(assignmentId: string, now = new Date()): void {
    const payload = this.read();
    const current = payload.assignments[assignmentId] ?? { items: {}, completedAt: null, missionsCompleted: 0 };
    payload.assignments[assignmentId] = { ...current, completedAt: now.toISOString() };
    payload.session = null;
    this.write(payload);
  }

  completeMission(assignment: HomeworkAssignment, now = new Date()): AssignmentProgress {
    const payload = this.read();
    const current = payload.assignments[assignment.id] ?? {
      items: {},
      completedAt: null,
      missionsCompleted: 0,
    };
    const assignmentComplete = assignment.items.every((item) => {
      const itemProgress = current.items[item.id];
      if (!itemProgress) return false;
      return (
        (!item.skills.includes("learn") || itemProgress.learned) &&
        (!item.skills.includes("write") || itemProgress.writingPractices > 0) &&
        (!item.skills.includes("recall") || itemProgress.recallCorrect > 0)
      );
    });
    const completed: AssignmentProgress = {
      ...current,
      missionsCompleted: current.missionsCompleted + 1,
      completedAt: assignmentComplete ? current.completedAt ?? now.toISOString() : null,
    };
    payload.assignments[assignment.id] = completed;
    payload.session = null;
    this.write(payload);
    return completed;
  }

  loadSession(): HomeworkSession | null {
    return this.read().session;
  }

  saveSession(session: HomeworkSession | null): void {
    const payload = this.read();
    payload.session = session;
    this.write(payload);
  }

  private updateItem(
    assignmentId: string,
    itemId: string,
    now: Date,
    update: (item: ItemProgress) => ItemProgress,
  ): void {
    const payload = this.read();
    const assignment = payload.assignments[assignmentId] ?? {
      items: {},
      completedAt: null,
      missionsCompleted: 0,
    };
    const current = assignment.items[itemId] ?? {
      learned: false,
      writingPractices: 0,
      recallCorrect: 0,
      recallIncorrect: 0,
      lastPracticed: "",
    };
    assignment.items[itemId] = {
      ...update(current),
      lastPracticed: now.toISOString(),
    };
    payload.assignments[assignmentId] = assignment;
    this.write(payload);
  }

  private read(): ProgressPayload {
    if (!this.storage) return initialPayload();
    try {
      const raw = this.storage.getItem(PROGRESS_KEY);
      if (!raw) return initialPayload();
      const parsed = JSON.parse(raw) as Partial<ProgressPayload>;
      if (parsed.version !== 1 || !parsed.assignments || typeof parsed.assignments !== "object") {
        return initialPayload();
      }
      const assignments: Record<string, AssignmentProgress> = {};
      for (const [id, rawAssignment] of Object.entries(parsed.assignments)) {
        const assignment = normalizeAssignmentProgress(rawAssignment);
        if (assignment) assignments[id] = assignment;
      }
      return { version: 1, assignments, session: normalizeSession(parsed.session) };
    } catch {
      return initialPayload();
    }
  }

  private write(payload: ProgressPayload): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(PROGRESS_KEY, JSON.stringify(payload));
    } catch {
      // Homework remains usable for the current screen even without persistence.
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
