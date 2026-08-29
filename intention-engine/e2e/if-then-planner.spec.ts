import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "intention-engine:loops:v1";

/**
 * The board is the active filter panel. Scoping to it keeps assertions away
 * from toast copy, which repeats the same trigger and action text.
 */
function board(page: Page) {
  return page.locator('[data-slot="tabs-content"]');
}

/**
 * Base UI mounts the incoming panel before detaching the outgoing one, so wait
 * for the switch to settle before asserting on panel contents.
 */
async function selectFilter(page: Page, name: string) {
  await page.getByRole("tab", { name }).click();
  await expect(board(page)).toHaveCount(1);
}

function trigger(page: Page) {
  return page.getByLabel("Trigger context");
}

function target(page: Page) {
  return page.getByLabel("Target step");
}

function armButton(page: Page) {
  return page.getByRole("button", { name: "Arm this loop" });
}

function connector(page: Page) {
  return page.locator('[data-slot="cue-connector"]');
}

function loopAction(page: Page, text: string) {
  return board(page).locator('[data-slot="loop-action"]', { hasText: text });
}

async function armLoop(page: Page, triggerText: string, targetText: string) {
  await trigger(page).fill(triggerText);
  await target(page).fill(targetText);
  await armButton(page).click();
  await expect(loopAction(page, targetText)).toBeVisible();
}

/** Reads what the app actually persisted, rather than trusting the rendered list. */
async function readCache(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { intentions: { id: string; action: string }[] }) : null;
  }, STORAGE_KEY);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(page.getByText("No loops yet")).toBeVisible();
});

test("locks the target step until a trigger context exists", async ({ page }) => {
  await expect(target(page)).toBeDisabled();
  await expect(armButton(page)).toBeDisabled();
  await expect(page.getByText("Locked", { exact: true })).toBeVisible();

  // Below the minimum length, the lock has to hold.
  await trigger(page).fill("ab");
  await expect(target(page)).toBeDisabled();
  await expect(page.getByText("4 chars min")).toBeVisible();

  await trigger(page).fill("I pour my morning coffee");
  await expect(target(page)).toBeEnabled();
  await expect(page.getByText("Cue set")).toBeVisible();
  await expect(page.getByText("Locked", { exact: true })).toBeHidden();

  // The trigger alone is not enough to commit.
  await expect(armButton(page)).toBeDisabled();
  await target(page).fill("I write tomorrow's three priorities");
  await expect(armButton(page)).toBeEnabled();

  // Emptying the trigger re-locks the target step.
  await trigger(page).fill("");
  await expect(target(page)).toBeDisabled();
  await expect(armButton(page)).toBeDisabled();
});

test("rewrites the sentence for each of the three cue configurations", async ({ page }) => {
  await expect(connector(page)).toHaveText("When");

  await page.getByRole("tab", { name: "Time" }).click();
  await expect(connector(page)).toHaveText("At");

  await page.getByRole("tab", { name: "Backup" }).click();
  await expect(connector(page)).toHaveText("If I miss");

  await armLoop(page, "the 7:15am window", "I do the 10-minute version");
  await expect(board(page).getByText("Backup", { exact: true })).toBeVisible();
});

test("strikes a loop through when it fires, and undoes it from the toast", async ({ page }) => {
  await armLoop(page, "I pour my morning coffee", "I write three priorities");

  const action = loopAction(page, "I write three priorities");
  await expect(action).not.toHaveClass(/line-through/);

  await board(page).getByRole("checkbox").click();
  await expect(page.getByText("Loop fired.")).toBeVisible();
  await expect(board(page).getByText("Fired", { exact: true })).toBeVisible();
  await expect(action).toHaveClass(/line-through/);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(action).not.toHaveClass(/line-through/);
  await expect(board(page).getByRole("checkbox")).not.toBeChecked();
});

test("restores a deleted loop when undo is pressed", async ({ page }) => {
  await armLoop(page, "I pour my morning coffee", "Write three priorities");
  await armLoop(page, "my alarm goes off", "Put on running shoes");
  await expect(page.getByRole("tab", { name: "All 2" })).toBeVisible();
  expect((await readCache(page))?.intentions).toHaveLength(2);

  await page.getByRole("button", { name: "Delete this loop" }).first().click();

  await expect(page.getByRole("tab", { name: "All 1" })).toBeVisible();
  await expect(page.getByText("Loop removed.")).toBeVisible();
  expect((await readCache(page))?.intentions).toHaveLength(1);

  await page.getByRole("button", { name: "Undo" }).click();

  await expect(page.getByRole("tab", { name: "All 2" })).toBeVisible();
  await expect(loopAction(page, "Put on running shoes")).toBeVisible();
  await expect(loopAction(page, "Write three priorities")).toBeVisible();
  expect((await readCache(page))?.intentions).toHaveLength(2);
});

test("keeps loops across a reload", async ({ page }) => {
  await armLoop(page, "I pour my morning coffee", "Write three priorities");
  await board(page).getByRole("checkbox").click();
  await expect(board(page).getByText("Fired", { exact: true })).toBeVisible();

  await page.reload();

  await expect(loopAction(page, "Write three priorities")).toBeVisible();
  await expect(board(page).getByRole("checkbox")).toBeChecked();
  await expect(page.getByText("1 of 1 fired")).toBeVisible();
});

test("round-trips loops through the transfer dialog", async ({ page }) => {
  await armLoop(page, "I pour my morning coffee", "Write three priorities");

  await page.getByRole("button", { name: "Import or export loops" }).click();
  await expect(page.getByRole("heading", { name: "Transfer payload" })).toBeVisible();

  const exported = await page.getByLabel("Your board as a payload").inputValue();
  expect(exported).toContain("intention-engine/loops");
  expect(exported).toContain("Write three priorities");

  // A bare array is a valid payload too.
  await page.getByRole("tab", { name: "Import" }).click();
  await page
    .getByLabel("Paste a payload from another device")
    .fill(
      '[{"cueType":"time","trigger":"my alarm goes off","action":"I put on my running shoes"}]',
    );
  await page.getByRole("button", { name: "Merge" }).click();

  await expect(page.getByRole("heading", { name: "Transfer payload" })).toBeHidden();
  await expect(loopAction(page, "I put on my running shoes")).toBeVisible();
  await expect(page.getByRole("tab", { name: "All 2" })).toBeVisible();
});

test("rejects an invalid payload without touching the board", async ({ page }) => {
  await armLoop(page, "I pour my morning coffee", "Write three priorities");

  await page.getByRole("button", { name: "Import or export loops" }).click();
  await page.getByRole("tab", { name: "Import" }).click();
  await page.getByLabel("Paste a payload from another device").fill("not json at all");
  await page.getByRole("button", { name: "Merge" }).click();

  await expect(page.getByText("That is not valid JSON.")).toBeVisible();
  // The dialog stays open so the payload can be corrected.
  await expect(page.getByRole("heading", { name: "Transfer payload" })).toBeVisible();
  expect((await readCache(page))?.intentions).toHaveLength(1);
});

test("filters the board by armed and fired", async ({ page }) => {
  await armLoop(page, "I pour my morning coffee", "Write three priorities");
  await armLoop(page, "my alarm goes off", "Put on running shoes");

  // The newest loop sorts first, so this fires the "running shoes" loop.
  await board(page).getByRole("checkbox").first().click();
  await expect(page.getByText("Loop fired.")).toBeVisible();

  await selectFilter(page, "Fired 1");
  await expect(loopAction(page, "Put on running shoes")).toBeVisible();
  await expect(loopAction(page, "Write three priorities")).toBeHidden();

  await selectFilter(page, "Armed 1");
  await expect(loopAction(page, "Write three priorities")).toBeVisible();
  await expect(loopAction(page, "Put on running shoes")).toBeHidden();

  await selectFilter(page, "All 2");
  await expect(loopAction(page, "Write three priorities")).toBeVisible();
  await expect(loopAction(page, "Put on running shoes")).toBeVisible();
});
