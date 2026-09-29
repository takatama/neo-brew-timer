import { expect, test, type Page } from "@playwright/test";

// Only environment setup is shared; keep the three user journeys readable.
test.beforeEach(async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === baseURL) return route.continue();
    return route.abort();
  });
  await page.addInitScript(() => {
    localStorage.setItem("coco-timer-settings", JSON.stringify({
      version: 7,
      state: { language: "en", sound: "off", vibrate: false, countdown: true, music: false, speed: 1 },
    }));
  });
  // Control browser time instead of waiting through a real brew.
  await page.clock.install({ time: new Date("2026-01-01T12:00:00Z") });
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("button", { name: "Start brewing", exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date("2026-01-01T12:01:00Z"));
});

const dial = (page: Page) => page.getByRole("timer");

test("the chosen amount carries into a brew that reaches completion", async ({ page }) => {
  await page.getByRole("button", { name: "1 gram more", exact: true }).click();
  await expect(page.getByText("315", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start brewing", exact: true }).click();

  await expect(page).toHaveURL(/\/en\/brew$/);
  await expect(page.getByText("21 g → 315 g")).toBeVisible();
  // During the lead-in the dial counts down and the card previews the bloom.
  await expect(dial(page)).toHaveText("Starting in 5 seconds");
  await expect(page.getByText("Bloom with 32g")).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();

  await page.clock.runFor(5_000);
  await expect(dial(page)).toContainText("Bloom. Scale should read 32 grams in total");
  await expect(dial(page)).toContainText("0:30 until the next pour");
  await expect(page.getByText("Pour to 63g")).toBeVisible();
  await expect(page.getByText("Pour 1 of 10")).toBeVisible();

  await page.clock.runFor(30_000);
  await expect(dial(page)).toContainText("Scale should read 63 grams in total");
  await expect(page.getByText("Pour 2 of 10")).toBeVisible();

  await page.clock.fastForward("03:10");
  await expect(page.getByRole("heading", { name: "Enjoy your coffee." })).toBeVisible();
  await expect(page.getByText("21 g coffee · 315 g water · 3:30")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Brew again", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByText("21", { exact: true })).toBeVisible();
});

test("pause holds time, leaving asks first, and starting over returns to 0:00", async ({ page }) => {
  await page.getByRole("button", { name: "Start brewing", exact: true }).click();
  await page.clock.runFor(8_000);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
  await expect(dial(page)).toContainText("Paused.");

  const paused = await dial(page).innerText();
  await page.clock.runFor(5_000);
  await expect(dial(page)).toHaveText(paused);

  // The close button and the browser's Back both confirm before ending.
  await page.getByRole("button", { name: "End brew", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("End this brew?");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "End brew", exact: true })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("dialog")).toContainText("End this brew?");
  await page.getByRole("button", { name: "Keep brewing", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/brew$/);

  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.runFor(2_000);
  await expect(dial(page)).not.toHaveText(paused);

  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Start over", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Start over", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
  await expect(page.getByText("Zero the scale with the grounds in")).toBeVisible();
  await page.clock.runFor(6_000);
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();

  // Ending a brew from the close button leaves at once, without asking twice.
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.clock.runFor(7_000);
  await page.getByRole("button", { name: "End brew", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "End brew", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("cancelling the lead-in prevents a delayed start and allows retry on a small phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: "Start brewing", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /Brew progress/ })).toBeVisible();
  await page.clock.runFor(8_000);
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dial(page)).toHaveText("Starting in 5 seconds");
  await page.clock.runFor(8_000);
  await expect(page.getByRole("button", { name: "Pause", exact: true })).toBeInViewport();
  await expect(dial(page)).toContainText("0:27 until the next pour");
});
