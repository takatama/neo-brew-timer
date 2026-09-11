import { describe, it, expect, vi, afterEach } from "vitest";
import { normalizeBeans, useSessionStore } from "./store";
afterEach(() => vi.unstubAllGlobals());
describe("bean amount", () => {
  it("bounds and rounds amounts, including malformed input", () => {
    expect(normalizeBeans(NaN)).toBe(20);
    expect(normalizeBeans(Infinity)).toBe(20);
    expect(normalizeBeans(-5)).toBe(1);
    expect(normalizeBeans(500)).toBe(100);
    expect(normalizeBeans(20.6)).toBe(21);
  });
  it("remembers the chosen amount without requiring storage to work", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });
    useSessionStore.getState().setBeans(25);
    expect(setItem).toHaveBeenCalledWith("neo-brew-beans", "25");
    setItem.mockImplementation(() => { throw new Error("Storage blocked"); });
    expect(() => useSessionStore.getState().setBeans(30)).not.toThrow();
    expect(useSessionStore.getState().beans).toBe(30);
  });
});
