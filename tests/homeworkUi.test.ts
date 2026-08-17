import type { HomeworkAssignment } from "@/homework/model";
import { HomeworkProgressStore } from "@/homework/progress";
import { HomeworkRepository } from "@/homework/repository";
import { HomeworkApp } from "@/homework/ui";
import { makeMemoryStorage } from "./memoryStorage";

const assignment: HomeworkAssignment = {
  id: "custom:2026-09-01:ui-test",
  title: "UI Test Homework",
  startDate: "2026-09-01",
  dueDate: "2026-09-05",
  source: "custom",
  items: [
    { id: "我", hanzi: "我", pinyin: "wǒ", english: "I", skills: ["learn", "write", "recall"] },
  ],
};

function setup(): {
  host: HTMLElement;
  app: HomeworkApp;
  repository: HomeworkRepository;
  progress: HomeworkProgressStore;
  storage: Storage;
  onFreePlay: ReturnType<typeof vi.fn>;
} {
  const storage = makeMemoryStorage();
  document.body.innerHTML = '<main id="test-root"></main>';
  const host = document.getElementById("test-root")!;
  const repository = new HomeworkRepository(storage);
  const progress = new HomeworkProgressStore(storage);
  const onFreePlay = vi.fn();
  repository.saveCustom(assignment);
  const app = new HomeworkApp(host, {
    repository,
    progress,
    onFreePlay,
    now: () => new Date(2026, 8, 2),
  });
  app.render();
  return { host, app, repository, progress, storage, onFreePlay };
}

function click(host: HTMLElement, selector: string): void {
  const element = host.querySelector<HTMLButtonElement>(selector);
  expect(element, selector).not.toBeNull();
  element!.click();
}

function answer(host: HTMLElement, label: string): void {
  const button = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-action="answer-question"]'))
    .find((candidate) => candidate.textContent?.trim() === label);
  expect(button, `answer ${label}`).toBeDefined();
  button!.click();
}

function answerFirstWrong(host: HTMLElement): void {
  const buttons = Array.from(host.querySelectorAll<HTMLButtonElement>('[data-action="answer-question"]'));
  const wrong = buttons.find((button) => button.textContent?.trim() !== "我");
  expect(wrong).toBeDefined();
  wrong!.click();
}

describe("HomeworkApp child flow", () => {
  it("advertises varied answer-first questions instead of a lesson path", () => {
    const { host } = setup();
    expect(host.querySelector("[data-testid=assignment-card]")?.textContent).toContain("UI Test Homework");
    expect(host.querySelector(".practice-mix")?.textContent).toContain("Answer from the very first screen");
    expect(host.querySelector(".practice-mix")?.textContent).toContain("Listen & pick");
    expect(host.querySelector(".homework-path")).toBeNull();
  });

  it("completes three immediate question styles for one item", () => {
    const { host, progress } = setup();
    click(host, '[data-action="start-session"]');
    expect(host.querySelector(".session-heading")?.textContent).toContain("Quick practice");
    expect(host.textContent).toContain("Which character did you hear?");

    answer(host, "我");
    expect(host.querySelector(".quiz-feedback")?.textContent).toContain("Yes!");
    click(host, '[data-action="next-question"]');
    expect(host.textContent).toContain("What does this character mean?");

    answer(host, "I");
    click(host, '[data-action="next-question"]');
    expect(host.textContent).toContain("Which character matches this meaning?");
    answer(host, "我");
    click(host, '[data-action="next-question"]');

    expect(host.querySelector("[data-testid=session-summary]")?.textContent).toContain("Mission complete");
    expect(host.querySelector("[data-testid=session-summary]")?.textContent).toContain("Seed planted");
    expect(progress.getAssignment(assignment.id).completedAt).not.toBeNull();
    expect(progress.getAssignment(assignment.id).items["我"]).toMatchObject({
      learned: true,
      writingPractices: 0,
      recallCorrect: 3,
    });
    expect(progress.getAssignment(assignment.id).missionsCompleted).toBe(1);
  });

  it("moves keyboard focus to immediate feedback and each new question", () => {
    const { host } = setup();
    click(host, '[data-action="start-session"]');
    expect(document.activeElement).toBe(host.querySelector(".study-card"));
    answer(host, "我");
    expect(document.activeElement).toBe(host.querySelector(".quiz-feedback"));
    click(host, '[data-action="next-question"]');
    expect(document.activeElement).toBe(host.querySelector(".study-card"));
    answer(host, "I");
    click(host, '[data-action="next-question"]');
    answer(host, "我");
    click(host, '[data-action="next-question"]');
    expect(document.activeElement).toBe(host.querySelector(".summary-card"));
  });

  it("shows the right answer immediately and brings a miss back in quick review", () => {
    const { host } = setup();
    click(host, '[data-action="start-session"]');
    answerFirstWrong(host);
    expect(host.querySelector(".quiz-feedback")?.textContent).toContain("Good try!");
    expect(host.querySelector(".quiz-feedback")?.textContent).toContain("我");
    click(host, '[data-action="next-question"]');
    answer(host, "I");
    click(host, '[data-action="next-question"]');
    answer(host, "我");
    click(host, '[data-action="next-question"]');

    expect(host.querySelector(".session-heading")?.textContent).toContain("Quick review");
    answer(host, "我");
    click(host, '[data-action="next-question"]');
    expect(host.querySelector("[data-testid=session-summary]")?.textContent).toContain("Mission complete");
  });

  it("opens Free Play through the injected navigation callback", () => {
    const { host, onFreePlay } = setup();
    click(host, '[data-action="free-play"]');
    expect(onFreePlay).toHaveBeenCalledOnce();
  });
});

describe("HomeworkApp authoring flow", () => {
  it("previews, validates, saves, and selects a pasted assignment", () => {
    const { host, repository } = setup();
    click(host, '[data-action="author"]');
    host.querySelector<HTMLInputElement>("[data-author-title]")!.value = "New Characters";
    host.querySelector<HTMLInputElement>("[data-author-start]")!.value = "2026-09-08";
    host.querySelector<HTMLInputElement>("[data-author-due]")!.value = "2026-09-12";
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "南 | nán | south\n西 | xī | west";

    click(host, '[data-action="preview-assignment"]');
    expect(host.querySelector("[data-testid=author-preview]")?.textContent).toContain("New Characters");
    expect(
      Array.from(host.querySelectorAll("[data-testid=author-preview] li > span")).map((node) => node.textContent),
    ).toEqual(["南", "西"]);

    click(host, '[data-action="save-assignment"]');
    const saved = repository.find("custom:2026-09-08:new-characters");
    expect(saved?.items).toHaveLength(2);
    expect(host.querySelector("[data-testid=assignment-card]")?.textContent).toContain("New Characters");
  });

  it("shows useful validation errors instead of saving incomplete rows", () => {
    const { host, repository } = setup();
    click(host, '[data-action="author"]');
    host.querySelector<HTMLInputElement>("[data-author-title]")!.value = "Broken";
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "東 only";
    click(host, '[data-action="save-assignment"]');
    expect(host.querySelector("[role=alert]")?.textContent).toContain("needs Hanzi, pinyin, and English");
    expect(repository.list().some((item) => item.title === "Broken")).toBe(false);
  });

  it("keeps the author on the form and announces a browser storage failure", () => {
    const { host, storage } = setup();
    click(host, '[data-action="author"]');
    host.querySelector<HTMLInputElement>("[data-author-title]")!.value = "Cannot save";
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "南 | nán | south";
    storage.setItem = () => { throw new Error("blocked"); };
    click(host, '[data-action="save-assignment"]');
    const alert = host.querySelector<HTMLElement>("[role=alert]");
    expect(alert?.textContent).toContain("could not save homework");
    expect(document.activeElement).toBe(alert);
    expect(host.querySelector("[data-author-form]")).not.toBeNull();
  });

  it("escapes authored text before rendering it", () => {
    const { host } = setup();
    click(host, '[data-action="author"]');
    host.querySelector<HTMLInputElement>("[data-author-title]")!.value = '<img src=x onerror="alert(1)">';
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "東 | dōng | <script>bad</script>";
    click(host, '[data-action="preview-assignment"]');
    expect(host.querySelector(".author-preview img")).toBeNull();
    expect(host.querySelector(".author-preview script")).toBeNull();
    expect(host.querySelector(".author-preview")?.textContent).toContain("<img");
  });
});
