import { gardenStageForMissions, planMissionItems } from "@/homework/mission";
import type { HomeworkAssignment } from "@/homework/model";
import type { AssignmentProgress } from "@/homework/progress";

const assignment: HomeworkAssignment = {
  id: "custom:mission",
  title: "Mission planning",
  startDate: "2026-09-01",
  dueDate: "2026-09-05",
  source: "custom",
  items: ["我", "你", "好", "大", "小"].map((hanzi) => ({
    id: hanzi,
    hanzi,
    pinyin: `${hanzi}-pinyin`,
    english: `${hanzi}-meaning`,
    skills: ["learn", "write", "recall"],
  })),
};

function progress(): AssignmentProgress {
  return { items: {}, completedAt: null, missionsCompleted: 0 };
}

describe("short homework mission planning", () => {
  it("introduces at most three new items in curriculum order", () => {
    expect(planMissionItems(assignment, progress()).map((item) => item.id)).toEqual(["我", "你", "好"]);
  });

  it("moves to unpracticed items after the first mission", () => {
    const current = progress();
    for (const id of ["我", "你", "好"]) {
      current.items[id] = {
        learned: true,
        writingPractices: 1,
        recallCorrect: 1,
        recallIncorrect: 0,
        lastPracticed: "2026-09-01T10:00:00.000Z",
      };
    }
    expect(planMissionItems(assignment, current).map((item) => item.id)).toEqual(["大", "小", "我"]);
  });

  it("prioritizes an item with more misses than successful recalls", () => {
    const current = progress();
    for (const [index, item] of assignment.items.entries()) {
      current.items[item.id] = {
        learned: true,
        writingPractices: 1,
        recallCorrect: 2,
        recallIncorrect: item.id === "好" ? 3 : 0,
        lastPracticed: `2026-09-0${index + 1}T10:00:00.000Z`,
      };
    }
    expect(planMissionItems(assignment, current)[0].id).toBe("好");
  });

  it("turns every completed mission into a deterministic garden stage", () => {
    expect(gardenStageForMissions(0).name).toBe("A quiet garden");
    expect(gardenStageForMissions(1).name).toBe("Seed planted");
    expect(gardenStageForMissions(99).name).toBe("Ink-spirit garden");
  });
});
