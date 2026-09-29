import { describe, expect, it } from "vitest";
import { choosePreferredLanguage, localizedPath, resolveRoute, switchLanguage } from "./routing";

describe("language-prefixed routing", () => {
  it("prefers a valid saved language, then a Japanese browser, then English", () => {
    expect(choosePreferredLanguage("en", "ja-JP")).toBe("en");
    expect(choosePreferredLanguage("invalid", "ja-JP")).toBe("ja");
    expect(choosePreferredLanguage(null, "fr-FR")).toBe("en");
  });

  it("keeps canonical URLs", () => {
    expect(resolveRoute("/en", "", "", "ja")).toEqual({ language: "en", page: "prepare", redirectTo: null });
    expect(resolveRoute("/ja/brew", "", "", "en")).toEqual({ language: "ja", page: "brew", redirectTo: null });
  });

  it("redirects the root and unprefixed pages to the preferred language", () => {
    expect(resolveRoute("/", "?beans=18", "", "ja").redirectTo).toBe("/ja?beans=18");
    expect(resolveRoute("/brew", "", "", "en").redirectTo).toBe("/en/brew");
  });

  it("sends earlier URLs to their new pages", () => {
    expect(resolveRoute("/en/setup", "", "", "ja").redirectTo).toBe("/en");
    expect(resolveRoute("/ja/intro", "", "", "en").redirectTo).toBe("/ja");
    expect(resolveRoute("/ja/timer", "", "#x", "en").redirectTo).toBe("/ja/brew#x");
    expect(resolveRoute("/timer", "", "", "en").redirectTo).toBe("/en/brew");
  });

  it("falls back to preparation for unknown paths", () => {
    expect(resolveRoute("/en/nope/deeper", "", "", "ja").redirectTo).toBe("/en");
    expect(resolveRoute("/fr/brew", "", "", "ja").redirectTo).toBe("/ja");
  });

  it("switches language without changing the page", () => {
    expect(switchLanguage("/en/brew", "ja")).toBe("/ja/brew");
    expect(switchLanguage("/ja", "en", "?beans=12")).toBe("/en?beans=12");
    expect(localizedPath("en", "prepare")).toBe("/en");
  });
});
