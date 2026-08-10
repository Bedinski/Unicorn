import type { HomeworkAssignment } from "./model";

export type HomeworkQuestionKind = "listen-choice" | "hanzi-meaning" | "meaning-hanzi";
export type HomeworkPhase = "quiz" | "review" | "complete";

export interface HomeworkQuestion {
  id: string;
  itemId: string;
  kind: HomeworkQuestionKind;
}

export interface HomeworkSession {
  version: 2;
  assignmentId: string;
  missionItemIds: string[];
  phase: HomeworkPhase;
  queue: HomeworkQuestion[];
  position: number;
  missed: string[];
  needsWork: string[];
  reviewAttempts: Record<string, number>;
  answeredQuestions: number;
  correctAnswers: number;
}

const QUESTION_KINDS: readonly HomeworkQuestionKind[] = [
  "listen-choice",
  "hanzi-meaning",
  "meaning-hanzi",
];

function question(itemId: string, kind: HomeworkQuestionKind, pass: number): HomeworkQuestion {
  return { id: `${itemId}:${kind}:${pass}`, itemId, kind };
}

/**
 * Build one fast mixed-practice mission. Every item appears in two different
 * question styles; a one-item assignment uses all three so it is still useful.
 */
export function startHomeworkSession(
  assignment: HomeworkAssignment,
  requestedItemIds: readonly string[] = assignment.items.map((item) => item.id),
): HomeworkSession {
  const assignmentIds = new Set(assignment.items.map((item) => item.id));
  const missionItemIds = [...new Set(requestedItemIds)].filter((id) => assignmentIds.has(id));
  const queue: HomeworkQuestion[] = [];

  for (const [index, itemId] of missionItemIds.entries()) {
    queue.push(question(itemId, QUESTION_KINDS[index % QUESTION_KINDS.length], 1));
  }
  for (const [index, itemId] of missionItemIds.entries()) {
    queue.push(question(itemId, QUESTION_KINDS[(index + 1) % QUESTION_KINDS.length], 2));
  }
  if (missionItemIds.length === 1) {
    queue.push(question(missionItemIds[0], QUESTION_KINDS[2], 3));
  }

  return {
    version: 2,
    assignmentId: assignment.id,
    missionItemIds,
    phase: queue.length > 0 ? "quiz" : "complete",
    queue,
    position: 0,
    missed: [],
    needsWork: [],
    reviewAttempts: {},
    answeredQuestions: 0,
    correctAnswers: 0,
  };
}

export function currentSessionQuestion(session: HomeworkSession): HomeworkQuestion | null {
  return session.queue[session.position] ?? null;
}

export function currentSessionItemId(session: HomeworkSession): string | null {
  return currentSessionQuestion(session)?.itemId ?? null;
}

/** Record an immediate multiple-choice answer and move to the next prompt. */
export function gradeHomeworkAnswer(
  session: HomeworkSession,
  correct: boolean,
): HomeworkSession {
  if (session.phase === "complete") return session;
  const current = currentSessionQuestion(session);
  if (!current) return { ...session, phase: "complete", queue: [], position: 0 };

  const missed = new Set(session.missed);
  const needsWork = new Set(session.needsWork);
  const reviewAttempts = { ...session.reviewAttempts };
  let queue = session.queue.slice();

  if (session.phase === "quiz") {
    if (!correct) missed.add(current.itemId);
  } else if (correct) {
    missed.delete(current.itemId);
    needsWork.delete(current.itemId);
  } else {
    const attempts = (reviewAttempts[current.itemId] ?? 0) + 1;
    reviewAttempts[current.itemId] = attempts;
    if (attempts < 2) {
      const nextKind = QUESTION_KINDS[(attempts + session.position) % QUESTION_KINDS.length];
      queue = [...queue, question(current.itemId, nextKind, attempts + 4)];
    } else {
      needsWork.add(current.itemId);
    }
  }

  const nextPosition = session.position + 1;
  const updated: HomeworkSession = {
    ...session,
    queue,
    position: nextPosition,
    missed: [...missed],
    needsWork: [...needsWork],
    reviewAttempts,
    answeredQuestions: session.answeredQuestions + 1,
    correctAnswers: session.correctAnswers + (correct ? 1 : 0),
  };
  if (nextPosition < queue.length) return updated;

  if (session.phase === "quiz" && missed.size > 0) {
    return {
      ...updated,
      phase: "review",
      queue: [...missed].map((itemId, index) =>
        question(itemId, QUESTION_KINDS[(index + 2) % QUESTION_KINDS.length], 4),
      ),
      position: 0,
    };
  }
  return { ...updated, phase: "complete", queue: [], position: 0 };
}

export function phaseLabel(phase: HomeworkPhase): string {
  if (phase === "review") return "Quick review";
  if (phase === "complete") return "Complete";
  return "Quick practice";
}
