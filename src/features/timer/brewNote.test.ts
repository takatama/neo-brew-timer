import { afterEach, describe, expect, it, vi } from "vitest";
import { readBrewNote, saveBrewNote } from "./brewNote";

describe("last brew note", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("recalls the last explicitly saved note and dose", () => {
    expect(saveBrewNote(20, " fruity ")).toBe(true);
    expect(saveBrewNote(21, " sweet ")).toBe(true);
    expect(readBrewNote()).toMatchObject({ beans: 21, text: "sweet" });
  });

  it("ignores damaged records and handles unavailable storage", () => {
    localStorage.setItem("neo-brew-last-note", "{");
    expect(readBrewNote()).toBeNull();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    expect(saveBrewNote(21, "sweet")).toBe(false);
  });
});
