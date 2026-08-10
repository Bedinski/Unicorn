import {
  customAssignmentId,
  isIsoDate,
  parseHomeworkRows,
  validateAssignment,
  type HomeworkAssignment,
} from "@/homework/model";

function validAssignment(): HomeworkAssignment {
  return {
    id: "custom:2026-09-01:test",
    title: "Test week",
    startDate: "2026-09-01",
    dueDate: "2026-09-05",
    source: "custom",
    items: [
      { id: "我", hanzi: "我", pinyin: "wǒ", english: "I", skills: ["learn", "write", "recall"] },
    ],
  };
}

describe("homework assignment validation", () => {
  it("accepts a complete assignment", () => {
    expect(validateAssignment(validAssignment())).toEqual([]);
  });

  it("validates real calendar dates", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("09/01/2026")).toBe(false);
  });

  it("rejects reversed dates, missing metadata, and duplicate hanzi", () => {
    const assignment = validAssignment();
    const issues = validateAssignment({
      ...assignment,
      title: "",
      startDate: "2026-09-10",
      dueDate: "2026-09-01",
      items: [assignment.items[0], { ...assignment.items[0], id: "duplicate", pinyin: "" }],
    });
    expect(issues.map((issue) => issue.message).join(" ")).toContain("Title is required");
    expect(issues.map((issue) => issue.message).join(" ")).toContain("Due date cannot");
    expect(issues.map((issue) => issue.message).join(" ")).toContain("appears more than once");
    expect(issues.map((issue) => issue.message).join(" ")).toContain("Add pinyin");
  });

  it("rejects missing and duplicate item ids used by sessions and progress", () => {
    const assignment = validAssignment();
    const issues = validateAssignment({
      ...assignment,
      items: [
        { ...assignment.items[0], id: "" },
        { ...assignment.items[0], hanzi: "你", id: "same" },
        { ...assignment.items[0], hanzi: "好", id: "same" },
      ],
    });
    const messages = issues.map((issue) => issue.message).join(" ");
    expect(messages).toContain("needs an item id");
    expect(messages).toContain("Item id same appears more than once");
  });
});

describe("parseHomeworkRows", () => {
  it("accepts pipe, tab, and comma-separated rows", () => {
    const parsed = parseHomeworkRows("我 | wǒ | I\n你\tnǐ\tyou\n好,hǎo,good");
    expect(parsed.issues).toEqual([]);
    expect(parsed.items.map((item) => item.hanzi)).toEqual(["我", "你", "好"]);
    expect(parsed.items[0].skills).toEqual(["learn", "write", "recall"]);
  });

  it("reports the source line for incomplete rows", () => {
    const parsed = parseHomeworkRows("我 | wǒ | I\nmissing fields");
    expect(parsed.items).toHaveLength(1);
    expect(parsed.issues[0].message).toContain("Line 2");
  });

  it("preserves commas inside an English meaning", () => {
    const parsed = parseHomeworkRows("會,huì,can, be able to");
    expect(parsed.items[0].english).toBe("can, be able to");
  });
});

describe("customAssignmentId", () => {
  it("creates stable readable ids", () => {
    expect(customAssignmentId("2026-09-01", "Week 1: Dictation!"))
      .toBe("custom:2026-09-01:week-1-dictation");
  });
});
