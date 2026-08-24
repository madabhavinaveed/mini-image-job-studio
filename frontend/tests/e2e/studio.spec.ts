import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("occibo.illustration-jobs");
  });
  await page.goto("/");
});

test("shows the create form, job list, and result sections", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /mini image job studio/i })).toBeVisible();
  await expect(page.getByLabel(/book title/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jobs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Job result" })).toBeVisible();
});

test("validates the illustration form before queueing", async ({ page }) => {
  await page.getByRole("button", { name: /queue illustration/i }).click();
  await expect(page.getByText(/book title is required/i)).toBeVisible();
  await expect(page.getByText(/scene text is required/i)).toBeVisible();
});

test("queues a sample job and shows the generated result", async ({ page }) => {
  await page.getByRole("button", { name: /load sample/i }).click();
  await page.getByRole("button", { name: /queue illustration/i }).click();

  await expect(page.getByRole("img", { name: /illustration for biscuit's muddy adventure/i })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText("completed", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/biscuit rolled happily in the muddy patch/i).first()).toBeVisible();
});

test("shows an error when the mock job fails", async ({ page }) => {
  await page.getByRole("button", { name: /load sample/i }).click();
  await page.getByLabel(/book title/i).fill("Biscuit [fail]");
  await page.getByRole("button", { name: /queue illustration/i }).click();

  await expect(page.getByText(/failed on purpose/i)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/no image was generated/i)).toBeVisible();
});
