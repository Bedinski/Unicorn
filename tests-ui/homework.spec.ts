import { expect, test, type Page } from "@playwright/test";

async function createAssignment(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Manage/ }).click();
  await page.getByLabel("Title").fill("September Characters");
  await page.getByLabel("Starts").fill("2026-09-08");
  await page.getByLabel("Due").fill("2026-09-12");
  await page.getByLabel("Characters and words").fill("東 | dōng | east");
  await page.getByRole("button", { name: "Preview & validate" }).click();
  await expect(page.getByTestId("author-preview")).toContainText("September Characters");
  await page.getByRole("button", { name: "Save homework" }).click();
}

async function answer(page: Page, label: string): Promise<void> {
  await page.getByTestId("study-card").getByRole("button", { name: label, exact: true }).click();
  await expect(page.locator(".quiz-feedback")).toBeVisible();
}

async function nextQuestion(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Next question/ }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("homework is the default experience and Free Play remains available", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "First Grade Mandarin" })).toBeVisible();
  await expect(page.getByTestId("assignment-card")).toBeVisible();
  await expect(page.getByRole("button", { name: /Start mission/ })).toBeVisible();
  await expect(page.getByText("Answer from the very first screen")).toBeVisible();

  await page.getByRole("button", { name: /Free Play/ }).click();
  await expect(page.getByRole("button", { name: /Back to Homework/ })).toBeVisible();
  await expect(page.getByLabel("Practice focus")).toBeVisible();
  await expect(page.getByLabel("Study set:")).toContainText("Week 1: School Places");
  await expect(page.getByLabel("Study set:")).toContainText("Colors");
});

test("Teacher Mode replaces the large mascot with an immediately usable dictation card", async ({ page }) => {
  await page.getByRole("button", { name: /Free Play/ }).click();
  await page.getByLabel("Study set:").selectOption("week-02");
  await page.getByRole("button", { name: "Teacher Mode (Dictation)" }).click();

  const card = page.getByLabel("Teacher Mode dictation card");
  const listen = page.getByRole("button", { name: "Listen" });
  await expect(page.getByRole("button", { name: "Back to Game" })).toBeVisible();
  await expect(card).toBeVisible();
  await expect(card).toBeFocused();
  await expect(page.locator("[data-kitty-stage]")).toHaveCount(0);
  await expect(page.locator(".teacher-progress-text")).toContainText("Card 1 of");
  const listenBox = await listen.boundingBox();
  expect(listenBox).not.toBeNull();
  expect(listenBox!.y + listenBox!.height).toBeLessThanOrEqual(720);

  await page.getByRole("button", { name: /Next/ }).click();
  await expect(page.locator(".teacher-progress-text")).toContainText("Card 2 of");
});

test("Teacher Mode controls remain above the fold on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: /Free Play/ }).click();
  await page.getByLabel("Study set:").selectOption("week-02");
  await page.getByRole("button", { name: "Teacher Mode (Dictation)" }).click();

  const listen = page.getByRole("button", { name: "Listen" });
  await expect(page.getByLabel("Teacher Mode dictation card")).toBeVisible();
  const listenBox = await listen.boundingBox();
  expect(listenBox).not.toBeNull();
  expect(listenBox!.y + listenBox!.height).toBeLessThanOrEqual(844);
  const widths = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
});

test("built-in study can be selected by week or category without dates", async ({ page }) => {
  const picker = page.getByRole("combobox", { name: "Choose by week or category" });
  const weekOptions = picker.locator('optgroup[label="By week"] option');
  await expect(weekOptions).toHaveText([
    "Week 1: School Places",
    "Week 2: Meizhou Chapter 1",
    "Week 3: School Supplies",
    "Week 4: Meizhou Chapter 2",
    "Week 5: Family & Hobbies",
    "Week 6: Meizhou Chapter 3",
    "Week 7: Taste, Opposites & Feelings",
    "Week 8: Meizhou Chapter 4",
    "Week 9: Action Words",
    "Week 10: Meizhou Chapter 8",
    "Week 11: Weather, Body & Useful Words",
    "Week 12: Meizhou Chapter 10",
  ]);
  await expect(picker.locator('optgroup[label="By category"] option')).toHaveCount(23);
  await expect(picker).not.toContainText(/20\d\d/);

  await picker.selectOption("builtin:first-grade-v2:week-03");
  await expect(page.getByTestId("assignment-card")).toContainText("Week 3: School Supplies");
  await picker.selectOption("builtin:first-grade-v2:category:hfw-colors");
  await expect(page.getByTestId("assignment-card")).toContainText("High Frequency Words · Colors");
});

test("pre–First Grade browser data is archived and cannot re-enter active study", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("magical-kitty-mandarin:homework-assignments:v1", JSON.stringify({
      version: 1,
      assignments: [{
        id: "custom:2026-01-01:legacy-greetings",
        title: "Legacy Greetings",
        startDate: "2026-01-01",
        dueDate: "2026-01-05",
        source: "custom",
        items: [{ id: "你好", hanzi: "你好", pinyin: "nǐhǎo", english: "hello", skills: ["learn", "write", "recall"] }],
      }],
    }));
    localStorage.setItem("magical-kitty-mandarin:v1", JSON.stringify({
      version: 3,
      state: {
        xp: 7,
        recentHanzi: ["你好", "東"],
        seenHanzi: ["耳朵", "東"],
        categoryCorrect: { greetings: 12, "hfw-school-places": 2 },
        selectedScopeId: "2026-02-09",
      },
    }));
  });
  await page.reload();

  const picker = page.getByRole("combobox", { name: "Choose by week or category" });
  await expect(picker).not.toContainText("Legacy Greetings");
  await expect(picker).not.toContainText("你好");
  const migration = await page.evaluate(() => ({
    archivedHomework: localStorage.getItem("magical-kitty-mandarin:archive:pre-first-grade:homework-assignments:v1"),
    archivedState: localStorage.getItem("magical-kitty-mandarin:archive:pre-first-grade:game-state:v1"),
    activeState: JSON.parse(localStorage.getItem("magical-kitty-mandarin:v1") ?? "null"),
  }));
  expect(migration.archivedHomework).toContain("Legacy Greetings");
  expect(migration.archivedState).toContain("你好");
  expect(migration.activeState.version).toBe(4);
  expect(migration.activeState.state.recentHanzi).toEqual(["東"]);
  expect(migration.activeState.state.seenHanzi).toEqual(["東"]);
  expect(migration.activeState.state.categoryCorrect).toEqual({ "hfw-school-places": 2 });
  expect(migration.activeState.state.selectedScopeId).toBeNull();
});

test("a parent can paste, validate, save, and edit a weekly assignment", async ({ page }) => {
  await createAssignment(page);
  await expect(page.getByTestId("assignment-card")).toContainText("September Characters");
  await expect(page.getByRole("combobox", { name: "Choose by week or category" }))
    .toHaveValue("custom:2026-09-08:september-characters");

  await page.getByRole("button", { name: /Manage/ }).click();
  await expect(page.locator(".saved-assignments").getByText("September Characters", { exact: true }))
    .toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByLabel("Characters and words")).toHaveValue("東 | dōng | east");
});

test("the first mission screen is an audible question with an immediate answer", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();

  await expect(page.getByText("Quick practice", { exact: true })).toBeVisible();
  await expect(page.getByText("Listen. Which character did you hear?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Hear the word again" })).toBeVisible();
  await expect(page.locator('.quiz-choice[data-action="answer-question"]')).toHaveCount(3);
  await expect(page.getByText("I learned it")).toHaveCount(0);
  await expect(page.getByText("Done writing")).toHaveCount(0);

  await answer(page, "東");
  await expect(page.locator(".quiz-feedback")).toContainText("Yes!");
  await expect(page.locator(".quiz-feedback")).toContainText("dōng");
});

test("keyboard focus follows feedback and each mixed question", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  await expect(page.getByTestId("study-card")).toBeFocused();

  await answer(page, "東");
  await expect(page.locator(".quiz-feedback")).toBeFocused();
  await nextQuestion(page);
  await expect(page.getByTestId("study-card")).toBeFocused();
  await answer(page, "east");
  await nextQuestion(page);
  await answer(page, "東");
  await nextQuestion(page);
  await expect(page.getByTestId("session-summary")).toBeFocused();
});

test("a weekly list becomes connected three-character mixed missions", async ({ page }) => {
  await page.getByRole("button", { name: /Manage/ }).click();
  await page.getByLabel("Title").fill("Four Character Week");
  await page.getByLabel("Starts").fill("2026-09-08");
  await page.getByLabel("Due").fill("2026-09-12");
  await page.getByLabel("Characters and words").fill(
    "東 | dōng | east\n南 | nán | south\n西 | xī | west\n北 | běi | north",
  );
  await page.getByRole("button", { name: "Save homework" }).click();

  await expect(page.locator(".mission-focus li")).toHaveCount(3);
  await expect(page.locator(".mission-focus li")).toHaveText(["東", "南", "西"]);
  await page.getByRole("button", { name: "Start mission" }).click();

  for (const label of ["東", "south", "西", "east", "南", "西"]) {
    await answer(page, label);
    await nextQuestion(page);
  }

  await expect(page.getByTestId("session-summary")).toContainText("Seed planted");
  await expect(page.getByTestId("session-summary")).not.toContainText("Week complete");
  await page.getByRole("button", { name: "Play another mission" }).click();
  await expect(page.getByTestId("study-card")).toContainText("北");
});

test("three fast question styles complete a one-character mission", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();

  await answer(page, "東");
  await nextQuestion(page);
  await expect(page.getByText("What does this character mean?")).toBeVisible();
  await answer(page, "east");
  await nextQuestion(page);
  await expect(page.getByText("Which character matches this meaning?")).toBeVisible();
  await answer(page, "東");
  await nextQuestion(page);

  await expect(page.getByTestId("session-summary")).toContainText("Mission complete");
  await expect(page.getByTestId("session-summary")).toContainText("Seed planted");
  await expect(page.getByTestId("session-summary")).toContainText("You finished every quick question");
  await page.getByRole("button", { name: "See my garden" }).click();
  await expect(page.getByTestId("assignment-card")).toContainText("Week complete");
});

test("a wrong answer is revealed immediately and repeated in quick review", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  const wrong = page.getByTestId("study-card").locator('.quiz-choice:not(:has-text("東"))').first();
  await wrong.click();
  await expect(page.locator(".quiz-feedback")).toContainText("Good try!");
  await expect(page.locator(".quiz-feedback")).toContainText("東 · dōng · east");
  await nextQuestion(page);

  await answer(page, "east");
  await nextQuestion(page);
  await answer(page, "東");
  await nextQuestion(page);
  await expect(page.getByText("Quick review", { exact: true })).toBeVisible();
  await expect(page.getByText("A missed word is back")).toBeVisible();
});

test("phone layout keeps the primary action and quick questions on screen without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const start = page.getByRole("button", { name: /Start mission/ });
  await expect(start).toBeVisible();
  const box = await start.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  let sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);

  await start.click();
  await expect(page.locator(".quiz-choices")).toBeVisible();
  sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
});
