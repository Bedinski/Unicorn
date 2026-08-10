import { BUILTIN_ASSIGNMENTS } from "@/homework/builtin";
import { validateAssignment } from "@/homework/model";

describe("built-in homework migration", () => {
  it("converts every curriculum week into a valid assignment", () => {
    expect(BUILTIN_ASSIGNMENTS).toHaveLength(14);
    for (const assignment of BUILTIN_ASSIGNMENTS) {
      expect(validateAssignment(assignment), assignment.id).toEqual([]);
    }
  });

  it("uses dictation meanings when the general vocabulary meaning differs", () => {
    const week = BUILTIN_ASSIGNMENTS.find((assignment) => assignment.id === "builtin:2026-03-09")!;
    const shi = week.items.find((item) => item.hanzi === "是")!;
    expect(shi.english).toBe("be/is");
  });

  it("gives writing weeks all four homework stages", () => {
    const writing = BUILTIN_ASSIGNMENTS.find((assignment) => assignment.id === "builtin:2026-02-09")!;
    expect(writing.items.every((item) => item.skills.includes("write"))).toBe(true);
  });

  it("uses the same complete learning path for recognition weeks", () => {
    const recognition = BUILTIN_ASSIGNMENTS.find((assignment) => assignment.id === "builtin:2026-02-17")!;
    expect(recognition.items.every((item) => item.skills.includes("write"))).toBe(true);
  });
});
