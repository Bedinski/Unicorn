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

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("homework is the default experience and Free Play remains available", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Magical Kitty Mandarin" })).toBeVisible();
  await expect(page.getByTestId("assignment-card")).toBeVisible();
  await expect(page.getByRole("button", { name: /Start mission/ })).toBeVisible();

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

test("keyboard submission and lesson transitions preserve focus", async ({ page }) => {
  await page.getByRole("button", { name: /Manage/ }).click();
  await page.getByLabel("Title").fill("Keyboard Homework");
  await page.getByLabel("Starts").fill("2026-09-08");
  await page.getByLabel("Due").fill("2026-09-12");
  await page.getByLabel("Characters and words").fill("我 | wǒ | I");
  await page.getByLabel("Title").press("Enter");
  await expect(page.getByTestId("assignment-card")).toContainText("Keyboard Homework");

  await page.getByRole("button", { name: "Start mission" }).click();
  await expect(page.getByTestId("study-card")).toBeFocused();
  await page.getByRole("button", { name: /I learned it/ }).click();
  await expect(page.getByTestId("study-card")).toBeFocused();
  await page.getByRole("button", { name: /Done writing/ }).click();
  await page.getByRole("button", { name: "Show answer" }).click();
  await expect(page.locator(".answer-reveal")).toBeFocused();
  await page.getByRole("button", { name: /I got it/ }).click();
  await expect(page.getByTestId("session-summary")).toBeFocused();
});

test("a weekly list becomes connected three-character missions", async ({ page }) => {
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

  for (let index = 0; index < 3; index++) await page.getByRole("button", { name: /I learned it/ }).click();
  for (let index = 0; index < 3; index++) await page.getByRole("button", { name: /Done writing/ }).click();
  for (let index = 0; index < 3; index++) {
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: /I got it/ }).click();
  }

  await expect(page.getByTestId("session-summary")).toContainText("Seed planted");
  await expect(page.getByTestId("session-summary")).not.toContainText("Weekly homework complete");
  await page.getByRole("button", { name: "Play another mission" }).click();
  await expect(page.getByTestId("study-card")).toContainText("大");
});

test("a child completes Learn, Write, Remember, and receives a summary", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();

  await expect(page.getByText("Learn", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /I learned it/ }).click();

  await expect(page.getByText("Write", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Done writing/ }).click();

  await expect(page.getByText("Remember", { exact: true })).toBeVisible();
  await expect(page.getByTestId("study-card")).not.toContainText("Does your writing match?");
  await page.getByRole("button", { name: "Show answer" }).click();
  await expect(page.getByTestId("study-card")).toContainText("Does your writing match?");
  await page.getByRole("button", { name: /I got it/ }).click();

  await expect(page.getByTestId("session-summary")).toContainText("Mission complete");
  await expect(page.getByTestId("session-summary")).toContainText("Seed planted");
  await expect(page.getByTestId("session-summary")).toContainText("You remembered every answer");
  await page.getByRole("button", { name: "See my garden" }).click();
  await expect(page.getByTestId("assignment-card")).toContainText("Weekly homework complete");
});

test("a missed answer is repeated in Review", async ({ page }) => {
  await createAssignment(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  await page.getByRole("button", { name: /I learned it/ }).click();
  await page.getByRole("button", { name: /Done writing/ }).click();
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Practice again" }).click();

  await expect(page.getByText("Review", { exact: true })).toBeVisible();
  await expect(page.getByText("Try this one again")).toBeVisible();
});

test("phone layout keeps the primary homework action visible without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const start = page.getByRole("button", { name: /Start mission/ });
  await expect(start).toBeVisible();
  const box = await start.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
});
