import {
  currentSessionItemId,
  currentSessionQuestion,
  gradeHomeworkAnswer,
  startHomeworkSession,
} from "@/homework/session";
import type { HomeworkAssignment } from "@/homework/model";

const assignment: HomeworkAssignment = {
  id: "custom:test",
  title: "Test",
  startDate: "2026-09-01",
  dueDate: "2026-09-05",
  source: "custom",
  items: [
    { id: "我", hanzi: "我", pinyin: "wǒ", english: "I", skills: ["learn", "write", "recall"] },
    { id: "你", hanzi: "你", pinyin: "nǐ", english: "you", skills: ["learn", "write", "recall"] },
  ],
};

describe("homework session engine", () => {
  it("starts with mixed answer-first questions instead of lesson phases", () => {
    const session = startHomeworkSession(assignment);
    expect(session.phase).toBe("quiz");
    expect(session.queue).toHaveLength(4);
    expect(session.queue.map((question) => question.kind)).toEqual([
      "listen-choice",
      "hanzi-meaning",
      "hanzi-meaning",
      "meaning-hanzi",
    ]);
    expect(currentSessionItemId(session)).toBe("我");
  });

  it("uses all three question styles for a one-item assignment", () => {
    const session = startHomeworkSession({ ...assignment, items: [assignment.items[0]] });
    expect(session.queue.map((question) => question.kind)).toEqual([
      "listen-choice",
      "hanzi-meaning",
      "meaning-hanzi",
    ]);
  });

  it("answers immediately, reviews a miss, and then completes", () => {
    let session = startHomeworkSession(assignment);
    session = gradeHomeworkAnswer(session, true);
    session = gradeHomeworkAnswer(session, true);
    session = gradeHomeworkAnswer(session, true);
    session = gradeHomeworkAnswer(session, false);
    expect(session.phase).toBe("review");
    expect(session.missed).toEqual(["你"]);
    expect(currentSessionQuestion(session)?.itemId).toBe("你");

    session = gradeHomeworkAnswer(session, true);
    expect(session.phase).toBe("complete");
    expect(session.needsWork).toEqual([]);
    expect(session.answeredQuestions).toBe(5);
    expect(session.correctAnswers).toBe(4);
  });

  it("marks an item for next time after two missed review questions", () => {
    const oneItem = { ...assignment, items: [assignment.items[0]] };
    let session = startHomeworkSession(oneItem);
    for (let index = 0; index < 3; index++) session = gradeHomeworkAnswer(session, false);
    expect(session.phase).toBe("review");

    session = gradeHomeworkAnswer(session, false);
    expect(session.phase).toBe("review");
    expect(session.queue).toHaveLength(2);
    session = gradeHomeworkAnswer(session, false);
    expect(session.phase).toBe("complete");
    expect(session.needsWork).toEqual(["我"]);
  });

  it("limits the question queue to requested short-mission items", () => {
    const session = startHomeworkSession(assignment, ["你"]);
    expect(session.missionItemIds).toEqual(["你"]);
    expect(session.queue).toHaveLength(3);
    expect(session.queue.every((question) => question.itemId === "你")).toBe(true);
  });
});
