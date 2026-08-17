import { STUDY_CATEGORIES } from "@/data/firstGrade";
import { BUILTIN_ASSIGNMENTS } from "@/homework/builtin";
import { validateAssignment } from "@/homework/model";

describe("built-in First Grade study sets", () => {
  it("creates twelve week sets plus every category set", () => {
    expect(BUILTIN_ASSIGNMENTS).toHaveLength(12 + STUDY_CATEGORIES.length);
    expect(BUILTIN_ASSIGNMENTS.filter((item) => item.curriculum?.kind === "week")).toHaveLength(12);
    expect(BUILTIN_ASSIGNMENTS.filter((item) => item.curriculum?.kind === "category")).toHaveLength(STUDY_CATEGORIES.length);
  });

  it("validates every built-in assignment", () => {
    for (const assignment of BUILTIN_ASSIGNMENTS) {
      expect(validateAssignment(assignment), assignment.id).toEqual([]);
      expect(assignment.items.every((item) => item.skills.includes("write"))).toBe(true);
    }
  });

  it("contains source-specific weekly characters", () => {
    const first = BUILTIN_ASSIGNMENTS.find((assignment) => assignment.id === "builtin:week-01")!;
    expect(first.items.map((item) => item.hanzi)).toEqual(expect.arrayContaining(["教室", "東", "西", "是", "個"]));
  });
});
