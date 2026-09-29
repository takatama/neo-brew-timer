import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === baseURL) return route.continue();
    if (url.hostname === "daily-brew.takatama.workers.dev")
      return route.fulfill({ json: { items: [] } });
    return route.abort();
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "coco-timer-settings",
      JSON.stringify({
        version: 7,
        state: {
          language: "en",
          notifyMode: "none",
          voice: "male",
          startDelay: true,
        },
      }),
    ),
  );
  await page.clock.install({ time: new Date("2026-01-01T12:00:00Z") });
  await page.goto("/");
  await expect(page).toHaveURL(/\/en\/setup$/);
  await expect(
    page.getByRole("button", { name: "Brew coffee", exact: true }),
  ).toBeVisible();
  await page.clock.pauseAt(new Date("2026-01-01T12:01:00Z"));
});
const countdown = (page: Page) => page.getByRole("timer");
const target = (page: Page, weight: number) =>
  page.getByLabel(`Cumulative water target ${weight}g`, { exact: true });

test("chosen dose reaches the right targets and completion without interrupting the brew for language changes", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("daily-brew")) requests.push(request.url());
  });
  await page
    .getByRole("button", { name: "Increase beans by 1g", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Beans", exact: true }),
  ).toHaveValue("21");
  await page.getByRole("button", { name: "Brew coffee", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/timer$/);
  await expect(page.getByText("Beans 21g", { exact: true })).toBeVisible();
  await expect(page.getByText("Water 315g", { exact: true })).toBeVisible();
  await expect(page.getByText("32g", { exact: true })).toBeVisible();
  await expect(countdown(page)).toHaveAccessibleName("Starting in 5s");
  await page.clock.runFor(6_000);
  await expect(target(page, 32)).toBeVisible();
  await expect(page.getByText("63g", { exact: true })).toBeVisible();
  const before = (await countdown(page).innerText()).match(/^\d+/)?.[0];
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("radio", { name: "日本語", exact: true }).click();
  await expect(page).toHaveURL(/\/ja\/timer$/);
  expect((await countdown(page).innerText()).match(/^\d+/)?.[0]).toBe(before);
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.clock.runFor(29_000);
  await expect(target(page, 63)).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.clock.fastForward(120_000);
  await expect(target(page, 315)).toBeVisible();
  await expect(
    page.getByText("That’s all the water. Let it drain through.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Let it drain", { exact: true })).toBeVisible();
  await page.clock.fastForward(60_000);
  await expect(
    page.getByText("Enjoy your coffee", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/If there’s water in the dripper/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toHaveCount(0);
  await expect.poll(() => requests.length).toBe(1);
  await page.getByRole("button", { name: "Brew again", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Beans", exact: true }),
  ).toHaveValue("21");
});

test("pause holds time, leaving is confirmed, and reset returns to the first target", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Brew coffee", exact: true }).click();
  await expect(countdown(page)).toHaveAccessibleName("Starting in 5s");
  await page.clock.runFor(8_000);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await countdown(page).innerText();
  await page.clock.runFor(10_000);
  await expect(countdown(page)).toHaveText(paused);
  await page.getByRole("button", { name: "Change beans", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Leaving this screen ends the brew",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Change beans", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.clock.runFor(2_000);
  await expect(countdown(page)).not.toHaveText(paused);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset", exact: true })
    .click();
  await expect(target(page, 30)).toBeVisible();
  await expect(countdown(page)).toHaveText("30sec");
  await expect(
    page.getByRole("button", { name: "Brew coffee", exact: true }),
  ).toBeVisible();
  await page.clock.runFor(10_000);
  await expect(countdown(page)).toHaveText("30sec");
});

test("startup can be canceled and retried, with the entire brew visible on a small phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("button", { name: "Brew coffee", exact: true }).click();
  const cancel = page.getByRole("button", {
    name: "Cancel start",
    exact: true,
  });
  await expect(cancel).toBeVisible();
  const cancelBox = await cancel.boundingBox();
  expect(cancelBox!.y + cancelBox!.height).toBeLessThanOrEqual(568);
  await cancel.click();
  await expect(target(page, 30)).toBeVisible();
  await page.clock.runFor(8_000);
  await expect(countdown(page)).toHaveText("30sec");
  await page.getByRole("button", { name: "Brew coffee", exact: true }).click();
  await expect(countdown(page)).toHaveAccessibleName("Starting in 5s");
  await page.clock.runFor(8_000);
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await expect(countdown(page)).not.toHaveText("30sec");
  expect(
    await page.evaluate(() => ({
      x: scrollX,
      y: scrollY,
      overflow: document.documentElement.scrollHeight > innerHeight + 1,
    })),
  ).toEqual({ x: 0, y: 0, overflow: false });
  await expect(
    page.getByRole("button", { name: "Settings", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Pour progress/ })).toBeVisible();
});
