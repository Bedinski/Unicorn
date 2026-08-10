import type { HomeworkAssignment } from "@/homework/model";
import {
  advanceHomeworkSession,
  currentSessionItemId,
  gradeHomeworkRecall,
  startHomeworkSession,
} from "@/homework/session";

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
  it("moves deterministically through learn, write, recall, review, and complete", () => {
    let session = startHomeworkSession(assignment);
    expect(session.phase).toBe("learn");
    expect(currentSessionItemId(session)).toBe("我");

    session = advanceHomeworkSession(session, assignment);
    session = advanceHomeworkSession(session, assignment);
    expect(session.phase).toBe("practice");

    session = advanceHomeworkSession(session, assignment);
    session = advanceHomeworkSession(session, assignment);
    expect(session.phase).toBe("recall");

    session = gradeHomeworkRecall(session, assignment, true);
    session = gradeHomeworkRecall(session, assignment, false);
    expect(session.phase).toBe("review");
    expect(session.queue).toEqual(["你"]);

    session = gradeHomeworkRecall(session, assignment, true);
    expect(session.phase).toBe("complete");
    expect(session.needsWork).toEqual([]);
  });

  it("requeues one failed review and marks it needs-work after the second miss", () => {
    const oneItem = {
      ...assignment,
      items: [assignment.items[0]],
    };
    let session = startHomeworkSession(oneItem);
    session = advanceHomeworkSession(session, oneItem);
    session = advanceHomeworkSession(session, oneItem);
    session = gradeHomeworkRecall(session, oneItem, false);
    expect(session.phase).toBe("review");
    session = gradeHomeworkRecall(session, oneItem, false);
    expect(session.phase).toBe("review");
    expect(session.queue).toEqual(["我", "我"]);
    session = gradeHomeworkRecall(session, oneItem, false);
    expect(session.phase).toBe("complete");
    expect(session.needsWork).toEqual(["我"]);
  });

  it("skips write when an assignment does not require it", () => {
    const recognition: HomeworkAssignment = {
      ...assignment,
      items: assignment.items.map((item) => ({ ...item, skills: ["learn", "recall"] })),
    };
    let session = startHomeworkSession(recognition);
    session = advanceHomeworkSession(session, recognition);
    session = advanceHomeworkSession(session, recognition);
    expect(session.phase).toBe("recall");
  });

  it("does not advance a graded phase without a grade", () => {
    const session = { ...startHomeworkSession(assignment), phase: "recall" as const, queue: ["我"], position: 0 };
    expect(advanceHomeworkSession(session, assignment)).toEqual(session);
  });

  it("limits every phase to the requested short-mission items", () => {
    let session = startHomeworkSession(assignment, ["你"]);
    expect(session.missionItemIds).toEqual(["你"]);
    expect(session.queue).toEqual(["你"]);
    session = advanceHomeworkSession(session, assignment);
    expect(session.phase).toBe("practice");
    expect(session.queue).toEqual(["你"]);
    session = advanceHomeworkSession(session, assignment);
    expect(session.phase).toBe("recall");
    expect(session.queue).toEqual(["你"]);
  });
});
