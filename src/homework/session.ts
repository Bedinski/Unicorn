import type { HomeworkAssignment, HomeworkSkill } from "./model";

export type HomeworkPhase = "learn" | "practice" | "recall" | "review" | "complete";

export interface HomeworkSession {
  version: 1;
  assignmentId: string;
  missionItemIds: string[];
  phase: HomeworkPhase;
  queue: string[];
  position: number;
  missed: string[];
  needsWork: string[];
  reviewAttempts: Record<string, number>;
}

function idsForSkill(
  assignment: HomeworkAssignment,
  skill: HomeworkSkill,
  missionItemIds: readonly string[],
): string[] {
  const itemsById = new Map(assignment.items.map((item) => [item.id, item]));
  return missionItemIds.filter((id) => itemsById.get(id)?.skills.includes(skill));
}

export function startHomeworkSession(
  assignment: HomeworkAssignment,
  requestedItemIds: readonly string[] = assignment.items.map((item) => item.id),
): HomeworkSession {
  const assignmentIds = new Set(assignment.items.map((item) => item.id));
  const missionItemIds = [...new Set(requestedItemIds)].filter((id) => assignmentIds.has(id));
  const session: HomeworkSession = {
    version: 1,
    assignmentId: assignment.id,
    missionItemIds,
    phase: "learn",
    queue: idsForSkill(assignment, "learn", missionItemIds),
    position: 0,
    missed: [],
    needsWork: [],
    reviewAttempts: {},
  };
  return skipEmptyPhases(session, assignment);
}

export function currentSessionItemId(session: HomeworkSession): string | null {
  return session.queue[session.position] ?? null;
}

export function advanceHomeworkSession(
  session: HomeworkSession,
  assignment: HomeworkAssignment,
): HomeworkSession {
  if (session.phase === "recall" || session.phase === "review" || session.phase === "complete") {
    return session;
  }
  const next = { ...session, position: session.position + 1 };
  return next.position < next.queue.length ? next : nextPhase(next, assignment);
}

export function gradeHomeworkRecall(
  session: HomeworkSession,
  assignment: HomeworkAssignment,
  correct: boolean,
): HomeworkSession {
  if (session.phase !== "recall" && session.phase !== "review") return session;
  const itemId = currentSessionItemId(session);
  if (!itemId) return nextPhase(session, assignment);

  const missed = new Set(session.missed);
  const needsWork = new Set(session.needsWork);
  const reviewAttempts = { ...session.reviewAttempts };
  let queue = session.queue.slice();

  if (session.phase === "recall") {
    if (!correct) missed.add(itemId);
  } else if (correct) {
    missed.delete(itemId);
    needsWork.delete(itemId);
  } else {
    const attempts = (reviewAttempts[itemId] ?? 0) + 1;
    reviewAttempts[itemId] = attempts;
    if (attempts < 2) queue = [...queue, itemId];
    else needsWork.add(itemId);
  }

  const next: HomeworkSession = {
    ...session,
    queue,
    position: session.position + 1,
    missed: [...missed],
    needsWork: [...needsWork],
    reviewAttempts,
  };
  return next.position < next.queue.length ? next : nextPhase(next, assignment);
}

function nextPhase(
  session: HomeworkSession,
  assignment: HomeworkAssignment,
): HomeworkSession {
  if (session.phase === "learn") {
    return skipEmptyPhases(
      { ...session, phase: "practice", queue: idsForSkill(assignment, "write", session.missionItemIds), position: 0 },
      assignment,
    );
  }
  if (session.phase === "practice") {
    return skipEmptyPhases(
      { ...session, phase: "recall", queue: idsForSkill(assignment, "recall", session.missionItemIds), position: 0 },
      assignment,
    );
  }
  if (session.phase === "recall") {
    if (session.missed.length > 0) {
      return { ...session, phase: "review", queue: session.missed.slice(), position: 0 };
    }
    return { ...session, phase: "complete", queue: [], position: 0 };
  }
  return { ...session, phase: "complete", queue: [], position: 0 };
}

function skipEmptyPhases(
  session: HomeworkSession,
  assignment: HomeworkAssignment,
): HomeworkSession {
  let next = session;
  while (next.phase !== "complete" && next.queue.length === 0) {
    next = nextPhase(next, assignment);
  }
  return next;
}

export function phaseLabel(phase: HomeworkPhase): string {
  const labels: Record<HomeworkPhase, string> = {
    learn: "Learn",
    practice: "Write",
    recall: "Remember",
    review: "Review",
    complete: "Complete",
  };
  return labels[phase];
}
