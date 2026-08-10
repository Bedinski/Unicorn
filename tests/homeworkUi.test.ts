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

describe("HomeworkApp child flow", () => {
  it("renders the recommended assignment above a clear four-step path", () => {
    const { host } = setup();
    expect(host.querySelector("[data-testid=assignment-card]")?.textContent).toContain("UI Test Homework");
    expect(host.querySelector(".homework-path")?.textContent).toContain("Learn");
    expect(host.querySelector(".homework-path")?.textContent).toContain("Remember");
  });

  it("completes a one-item Learn → Write → Remember session", () => {
    const { host, progress } = setup();
    click(host, '[data-action="start-session"]');
    expect(host.querySelector(".session-heading")?.textContent).toContain("Learn");

    click(host, '[data-action="advance-session"]');
    expect(host.querySelector(".session-heading")?.textContent).toContain("Write");

    click(host, '[data-action="advance-session"]');
    expect(host.querySelector(".session-heading")?.textContent).toContain("Remember");
    expect(host.textContent).not.toContain("Does your writing match?");

    click(host, '[data-action="reveal-answer"]');
    expect(host.textContent).toContain("Does your writing match?");
    click(host, '[data-action="grade"][data-correct="true"]');

    expect(host.querySelector("[data-testid=session-summary]")?.textContent).toContain("Mission complete");
    expect(host.querySelector("[data-testid=session-summary]")?.textContent).toContain("Seed planted");
    expect(progress.getAssignment(assignment.id).completedAt).not.toBeNull();
    expect(progress.getAssignment(assignment.id).items["我"]).toMatchObject({
      learned: true,
      writingPractices: 1,
      recallCorrect: 1,
    });
    expect(progress.getAssignment(assignment.id).missionsCompleted).toBe(1);
  });

  it("moves keyboard focus to each new lesson surface", () => {
    const { host } = setup();
    click(host, '[data-action="start-session"]');
    expect(document.activeElement).toBe(host.querySelector(".study-card"));
    click(host, '[data-action="advance-session"]');
    expect(document.activeElement).toBe(host.querySelector(".study-card"));
    click(host, '[data-action="advance-session"]');
    click(host, '[data-action="reveal-answer"]');
    expect(document.activeElement).toBe(host.querySelector(".answer-reveal"));
    click(host, '[data-action="grade"][data-correct="true"]');
    expect(document.activeElement).toBe(host.querySelector(".summary-card"));
  });

  it("routes a missed answer through review before completion", () => {
    const { host } = setup();
    click(host, '[data-action="start-session"]');
    click(host, '[data-action="advance-session"]');
    click(host, '[data-action="advance-session"]');
    click(host, '[data-action="reveal-answer"]');
    click(host, '[data-action="grade"][data-correct="false"]');
    expect(host.querySelector(".session-heading")?.textContent).toContain("Review");
    click(host, '[data-action="reveal-answer"]');
    click(host, '[data-action="grade"][data-correct="true"]');
    expect(host.querySelector("[data-testid=session-summary]")?.textContent).toContain("0Keep practicing");
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
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "你 | nǐ | you\n好 | hǎo | good";

    click(host, '[data-action="preview-assignment"]');
    expect(host.querySelector("[data-testid=author-preview]")?.textContent).toContain("New Characters");
    expect(
      Array.from(host.querySelectorAll("[data-testid=author-preview] li > span")).map((node) => node.textContent),
    ).toEqual(["你", "好"]);

    click(host, '[data-action="save-assignment"]');
    const saved = repository.find("custom:2026-09-08:new-characters");
    expect(saved?.items).toHaveLength(2);
    expect(host.querySelector("[data-testid=assignment-card]")?.textContent).toContain("New Characters");
  });

  it("shows useful validation errors instead of saving incomplete rows", () => {
    const { host, repository } = setup();
    click(host, '[data-action="author"]');
    host.querySelector<HTMLInputElement>("[data-author-title]")!.value = "Broken";
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "我 only";
    click(host, '[data-action="save-assignment"]');
    expect(host.querySelector("[role=alert]")?.textContent).toContain("needs Hanzi, pinyin, and English");
    expect(repository.list().some((item) => item.title === "Broken")).toBe(false);
  });

  it("keeps the author on the form and announces a browser storage failure", () => {
    const { host, storage } = setup();
    click(host, '[data-action="author"]');
    host.querySelector<HTMLInputElement>("[data-author-title]")!.value = "Cannot save";
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "你 | nǐ | you";
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
    host.querySelector<HTMLTextAreaElement>("[data-author-rows]")!.value = "我 | wǒ | <script>bad</script>";
    click(host, '[data-action="preview-assignment"]');
    expect(host.querySelector(".author-preview img")).toBeNull();
    expect(host.querySelector(".author-preview script")).toBeNull();
    expect(host.querySelector(".author-preview")?.textContent).toContain("<img");
  });
});
