import { describe, expect, it } from "vitest";
import {
  choosePreferredLanguage,
  replacePathLanguage,
  resolveAppRoute,
} from "./routing";

describe("language-prefixed routing", () => {
  it("prefers a valid saved language, then Japanese browser language, then English", () => {
    expect(choosePreferredLanguage("en", "ja-JP")).toBe("en");
    expect(choosePreferredLanguage("invalid", "ja-JP")).toBe("ja");
    expect(choosePreferredLanguage(undefined, "fr-FR")).toBe("en");
  });

  it("keeps canonical URLs and safely redirects legacy or unsupported URLs", () => {
    expect(resolveAppRoute("/en/setup", "", "", "ja", false)).toEqual({
      language: "en",
      page: "setup",
      redirectTo: null,
    });
    expect(resolveAppRoute("/timer", "?autostart=1", "#brew", "ja", false).redirectTo)
      .toBe("/ja/timer?autostart=1#brew");
    expect(resolveAppRoute("/fr/setup", "", "", "en", false).redirectTo)
      .toBe("/en/setup");
    expect(resolveAppRoute("/not-a-page", "", "", "ja", true).redirectTo)
      .toBe("/ja/setup");
  });

  it("uses intro before it is seen and setup afterwards for a root URL", () => {
    expect(resolveAppRoute("/", "", "", "ja", false).redirectTo).toBe("/ja/intro");
    expect(resolveAppRoute("/", "", "", "ja", true).redirectTo).toBe("/ja/setup");
  });

  it("changes only the language while preserving page, query, and hash", () => {
    expect(replacePathLanguage("/ja/timer", "en", "?autostart=1", "#brew"))
      .toBe("/en/timer?autostart=1#brew");
  });
});
