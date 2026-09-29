import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Finish, webglAvailable } from "./Finish";

describe("finish visual", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws the SVG cup where WebGL is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(webglAvailable()).toBe(false);
    const { container } = render(<Finish />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
  });
});
