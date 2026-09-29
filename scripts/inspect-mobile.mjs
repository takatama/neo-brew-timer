import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseURL = process.env.APP_URL ?? "http://127.0.0.1:5173";
const output = resolve(process.env.SCREENSHOT_DIR ?? "test-results/mobile");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.BROWSER_EXECUTABLE_PATH
    ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
    : {}),
});
const report = [];
try {
  for (const [language, width, height] of [
    ["ja", 390, 844],
    ["en", 390, 844],
    ["ja", 320, 568],
    ["en", 320, 568],
    ["ja", 430, 932],
    ["ja", 844, 390],
    ["en", 844, 390],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      locale: language === "ja" ? "ja-JP" : "en-US",
      serviceWorkers: "block",
      reducedMotion: width === 430 ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(
      ({ language }) =>
        localStorage.setItem(
          "coco-timer-settings",
          JSON.stringify({
            version: 7,
            state: {
              language,
              notifyMode: "none",
              voice: "male",
              startDelay: true,
            },
          }),
        ),
      { language },
    );
    await page.route("https://**/*", (route) =>
      route.fulfill({ json: { items: [] } }),
    );
    await page.clock.install();
    const capture = async (name) => {
      const geometry = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        scrollY,
      }));
      if (geometry.scrollWidth > width)
        throw new Error(`${language}/${width}/${name}: horizontal overflow`);
      if (
        ["start", "bloom", "pour", "imminent", "paused", "last"].includes(
          name,
        ) &&
        (geometry.scrollY !== 0 || geometry.scrollHeight > height + 1)
      )
        throw new Error(`${language}/${width}/${name}: brew needs scrolling`);
      await page.screenshot({
        path: resolve(output, `${language}-${width}-${name}.png`),
      });
      report.push({ language, width, name, ...geometry });
    };
    await page.goto(`${baseURL}/${language}/setup`);
    const start = page.getByRole("button", {
      name: language === "ja" ? "淹れる" : "Brew coffee",
      exact: true,
    });
    await start.waitFor();
    await capture("setup");
    await page
      .getByRole("button", {
        name: language === "ja" ? "設定" : "Settings",
        exact: true,
      })
      .click();
    await page.getByRole("dialog").waitFor();
    await capture("settings");
    await page
      .getByRole("button", {
        name: language === "ja" ? "閉じる" : "Close",
        exact: true,
      })
      .click();
    await start.click();
    await page
      .getByRole("button", {
        name: language === "ja" ? "取り消す" : "Cancel start",
        exact: true,
      })
      .waitFor();
    await capture("start");
    await page.clock.runFor(6000);
    await capture("bloom");
    await page.clock.runFor(60000);
    await capture("pour");
    await page.clock.runFor(10000);
    await capture("imminent");
    await page
      .getByRole("button", {
        name: language === "ja" ? "一時停止" : "Pause",
        exact: true,
      })
      .click();
    await capture("paused");
    await page
      .getByRole("button", {
        name: language === "ja" ? "再開" : "Resume",
        exact: true,
      })
      .click();
    await page.clock.runFor(80000);
    await capture("last");
    await page.clock.runFor(60000);
    await capture("finish");
    if (errors.length) throw new Error(errors.join("\n"));
    await context.close();
  }
  await writeFile(
    resolve(output, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(`Inspected ${report.length} screens. Screenshots: ${output}`);
} finally {
  await browser.close();
}
