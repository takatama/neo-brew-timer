import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useSessionStore } from "../../features/timer/store";
import { DisplayLanguageProvider } from "../../shared/i18n/DisplayLanguage";
import i18n from "../../shared/i18n/config";
import { IntroPage } from "./IntroPage";

describe("intro page", () => {
  beforeEach(async () => {
    localStorage.clear();
    useSessionStore.setState({ beans: 24, introSeen: false });
    await i18n.changeLanguage("ja");
  });

  afterEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("explains the guide and continues to setup without changing the saved dose", () => {
    render(
      <DisplayLanguageProvider language="ja">
        <MemoryRouter initialEntries={["/ja/intro"]}>
          <Routes>
            <Route path="/ja/intro" element={<IntroPage />} />
            <Route path="/ja/setup" element={<div>setup destination</div>} />
          </Routes>
        </MemoryRouter>
      </DisplayLanguageProvider>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "迷わず注ぐ、10回" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "用意するもの" })).toBeVisible();
    expect(screen.getByRole("button", { name: "豆の量を設定する" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "豆の量を設定する" }));

    expect(screen.getByText("setup destination")).toBeVisible();
    expect(useSessionStore.getState()).toMatchObject({ beans: 24, introSeen: true });
    expect(localStorage.getItem("brewsteps_intro_seen")).toBe("1");
  });
});
