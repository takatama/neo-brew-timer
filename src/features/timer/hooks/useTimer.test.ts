import { describe, expect, it } from "vitest";
import { useTimer } from "./useTimer";
import { useBrewTimer } from "../../../shared/brew-timer";

describe("useTimer compatibility export", () => {
  it("points to the shared timer", () => {
    expect(useTimer).toBe(useBrewTimer);
  });
});
