import type { HomeworkAssignment } from "@/homework/model";
import { HomeworkProgressStore } from "@/homework/progress";
import { HomeworkRepository, recommendedAssignment } from "@/homework/repository";
import { startHomeworkSession } from "@/homework/session";
import { makeMemoryStorage } from "./memoryStorage";

const custom: HomeworkAssignment = {
  id: "custom:2026-09-01:test",
  title: "September homework",
  startDate: "2026-09-01",
  dueDate: "2026-09-05",
  source: "custom",
  items: [
    { id: "我", hanzi: "我", pinyin: "wǒ", english: "I", skills: ["learn", "write", "recall"] },
  ],
};

describe("HomeworkRepository", () => {
  let storage: Storage;
  beforeEach(() => {
    storage = makeMemoryStorage();
  });

  it("saves, updates, and deletes custom assignments", () => {
    const repository = new HomeworkRepository(storage);
    repository.saveCustom(custom);
    expect(repository.find(custom.id)?.title).toBe(custom.title);
    repository.saveCustom({ ...custom, title: "Updated" });
    expect(repository.list().filter((item) => item.id === custom.id)).toHaveLength(1);
    expect(repository.find(custom.id)?.title).toBe("Updated");
    repository.deleteCustom(custom.id);
    expect(repository.find(custom.id)).toBeNull();
  });

  it("ignores corrupted custom storage", () => {
    storage.setItem("magical-kitty-mandarin:homework-assignments:v1", "not json");
    expect(new HomeworkRepository(storage).list().length).toBe(35);
  });

  it("keeps valid custom weeks when another stored entry is malformed", () => {
    storage.setItem("magical-kitty-mandarin:homework-assignments:v1", JSON.stringify({
      version: 1,
      assignments: [{ id: "custom:broken", source: "custom" }, custom],
    }));
    expect(new HomeworkRepository(storage).find(custom.id)?.title).toBe(custom.title);
  });

  it("reports storage failures instead of pretending a save succeeded", () => {
    const blocked = makeMemoryStorage();
    blocked.setItem = () => { throw new Error("blocked"); };
    expect(() => new HomeworkRepository(blocked).saveCustom(custom)).toThrow("could not save homework");
  });

  it("rejects custom assignments whose ids could collide with built-in data", () => {
    const repository = new HomeworkRepository(storage);
    expect(() => repository.saveCustom({ ...custom, id: "week-1" })).toThrow("unique custom id");
  });

  it("selects the active week, then the most recent past week", () => {
    expect(recommendedAssignment([custom], "2026-09-03")?.id).toBe(custom.id);
    expect(recommendedAssignment([custom], "2026-10-01")?.id).toBe(custom.id);
  });

  it("selects the newest week when active date ranges overlap", () => {
    const newer = { ...custom, id: "custom:2026-09-03:newer", startDate: "2026-09-03", dueDate: "2026-09-10" };
    expect(recommendedAssignment([custom, newer], "2026-09-04")?.id).toBe(newer.id);
  });
});

describe("HomeworkProgressStore", () => {
  let storage: Storage;
  beforeEach(() => {
    storage = makeMemoryStorage();
  });

  it("tracks each learning skill independently and persists a session", () => {
    const store = new HomeworkProgressStore(storage);
    store.recordLearned(custom.id, "我", new Date("2026-09-01T10:00:00Z"));
    store.recordWriting(custom.id, "我", new Date("2026-09-01T10:01:00Z"));
    store.recordRecall(custom.id, "我", false, new Date("2026-09-01T10:02:00Z"));
    store.recordRecall(custom.id, "我", true, new Date("2026-09-01T10:03:00Z"));
    const item = store.getAssignment(custom.id).items["我"];
    expect(item).toMatchObject({ learned: true, writingPractices: 1, recallCorrect: 1, recallIncorrect: 1 });

    const session = startHomeworkSession(custom);
    store.saveSession(session);
    expect(new HomeworkProgressStore(storage).loadSession()).toEqual(session);
  });

  it("marks completion and clears the resumable session", () => {
    const store = new HomeworkProgressStore(storage);
    store.saveSession(startHomeworkSession(custom));
    store.complete(custom.id, new Date("2026-09-05T12:00:00Z"));
    expect(store.getAssignment(custom.id).completedAt).toBe("2026-09-05T12:00:00.000Z");
    expect(store.loadSession()).toBeNull();
  });

  it("advances one persistent mission without completing an unfinished week", () => {
    const twoItems: HomeworkAssignment = {
      ...custom,
      items: [
        ...custom.items,
        { id: "你", hanzi: "你", pinyin: "nǐ", english: "you", skills: ["learn", "write", "recall"] },
      ],
    };
    const store = new HomeworkProgressStore(storage);
    store.recordLearned(twoItems.id, "我");
    store.recordWriting(twoItems.id, "我");
    store.recordRecall(twoItems.id, "我", true);
    const afterFirst = store.completeMission(twoItems, new Date("2026-09-01T12:00:00Z"));
    expect(afterFirst.missionsCompleted).toBe(1);
    expect(afterFirst.completedAt).toBeNull();

    store.recordLearned(twoItems.id, "你");
    store.recordWriting(twoItems.id, "你");
    store.recordRecall(twoItems.id, "你", true);
    const afterSecond = store.completeMission(twoItems, new Date("2026-09-02T12:00:00Z"));
    expect(afterSecond.missionsCompleted).toBe(2);
    expect(afterSecond.completedAt).toBe("2026-09-02T12:00:00.000Z");
    expect(store.getTotalMissionsCompleted()).toBe(2);
  });

  it("sanitizes malformed saved progress and discards invalid sessions", () => {
    storage.setItem("magical-kitty-mandarin:homework-progress:v1", JSON.stringify({
      version: 1,
      assignments: {
        [custom.id]: {
          items: {
            "我": { learned: "yes", writingPractices: -4, recallCorrect: 2.5, recallIncorrect: 3 },
          },
          completedAt: 123,
        },
        broken: null,
      },
      session: {
        version: 1,
        assignmentId: custom.id,
        phase: "learn",
        queue: ["我"],
        position: 8,
        missed: [],
        needsWork: [],
        reviewAttempts: {},
      },
    }));
    const store = new HomeworkProgressStore(storage);
    expect(store.getAssignment(custom.id).items["我"]).toEqual({
      learned: false,
      writingPractices: 0,
      recallCorrect: 0,
      recallIncorrect: 3,
      lastPracticed: "",
    });
    expect(store.getAssignment(custom.id).completedAt).toBeNull();
    expect(store.loadSession()).toBeNull();
  });
});
