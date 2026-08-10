import { expect, test, type Page } from "@playwright/test";

async function createAssignment(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Manage/ }).click();
  await page.getByLabel("Title").fill("September Characters");
  await page.getByLabel("Starts").fill("2026-09-08");
  await page.getByLabel("Due").fill("2026-09-12");
  await page.getByLabel("Characters and words").fill("我 | wǒ | I");
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
  await expect(page.getByRole("heading", { name: "Magical Kitty Mandarin" })).toBeVisible();
  await expect(page.getByTestId("assignment-card")).toBeVisible();
  await expect(page.getByRole("button", { name: /Start mission/ })).toBeVisible();
  await expect(page.getByText("Answer from the very first screen")).toBeVisible();

  await page.getByRole("button", { name: /Free Play/ }).click();
  await expect(page.getByRole("button", { name: /Back to Homework/ })).toBeVisible();
  await expect(page.getByLabel("Practice focus")).toBeVisible();
});

test("a parent can paste, validate, save, and edit a weekly assignment", async ({ page }) => {
  await createAssignment(page);
  await expect(page.getByTestId("assignment-card")).toContainText("September Characters");
  await expect(page.getByRole("combobox", { name: "Homework week" }))
    .toHaveValue("custom:2026-09-08:september-characters");

  await page.getByRole("button", { name: /Manage/ }).click();
  await expect(page.locator(".saved-assignments").getByText("September Characters", { exact: true }))
    .toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByLabel("Characters and words")).toHaveValue("我 | wǒ | I");
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

  await answer(page, "我");
  await expect(page.locator(".quiz-feedback")).toContainText("Yes!");
  await expect(page.locator(".quiz-feedback")).toContainText("wǒ");
});

test("keyboard focus follows feedback and each mixed question", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  await expect(page.getByTestId("study-card")).toBeFocused();

  await answer(page, "我");
  await expect(page.locator(".quiz-feedback")).toBeFocused();
  await nextQuestion(page);
  await expect(page.getByTestId("study-card")).toBeFocused();
  await answer(page, "I");
  await nextQuestion(page);
  await answer(page, "我");
  await nextQuestion(page);
  await expect(page.getByTestId("session-summary")).toBeFocused();
});

test("a weekly list becomes connected three-character mixed missions", async ({ page }) => {
  await page.getByRole("button", { name: /Manage/ }).click();
  await page.getByLabel("Title").fill("Four Character Week");
  await page.getByLabel("Starts").fill("2026-09-08");
  await page.getByLabel("Due").fill("2026-09-12");
  await page.getByLabel("Characters and words").fill(
    "我 | wǒ | I\n你 | nǐ | you\n好 | hǎo | good\n大 | dà | big",
  );
  await page.getByRole("button", { name: "Save homework" }).click();

  await expect(page.locator(".mission-focus li")).toHaveCount(3);
  await expect(page.locator(".mission-focus li")).toHaveText(["我", "你", "好"]);
  await page.getByRole("button", { name: "Start mission" }).click();

  for (const label of ["我", "you", "好", "I", "你", "好"]) {
    await answer(page, label);
    await nextQuestion(page);
  }

  await expect(page.getByTestId("session-summary")).toContainText("Seed planted");
  await expect(page.getByTestId("session-summary")).not.toContainText("Weekly homework complete");
  await page.getByRole("button", { name: "Play another mission" }).click();
  await expect(page.getByTestId("study-card")).toContainText("大");
});

test("three fast question styles complete a one-character mission", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();

  await answer(page, "我");
  await nextQuestion(page);
  await expect(page.getByText("What does this character mean?")).toBeVisible();
  await answer(page, "I");
  await nextQuestion(page);
  await expect(page.getByText("Which character matches this meaning?")).toBeVisible();
  await answer(page, "我");
  await nextQuestion(page);

  await expect(page.getByTestId("session-summary")).toContainText("Mission complete");
  await expect(page.getByTestId("session-summary")).toContainText("Seed planted");
  await expect(page.getByTestId("session-summary")).toContainText("You finished every quick question");
  await page.getByRole("button", { name: "See my garden" }).click();
  await expect(page.getByTestId("assignment-card")).toContainText("Weekly homework complete");
});

test("a wrong answer is revealed immediately and repeated in quick review", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  const wrong = page.getByTestId("study-card").locator('.quiz-choice:not(:has-text("我"))').first();
  await wrong.click();
  await expect(page.locator(".quiz-feedback")).toContainText("Good try!");
  await expect(page.locator(".quiz-feedback")).toContainText("我 · wǒ · I");
  await nextQuestion(page);

  await answer(page, "I");
  await nextQuestion(page);
  await answer(page, "我");
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
