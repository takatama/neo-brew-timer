import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DisplayLanguageProvider } from "../../shared/i18n/DisplayLanguage";
import i18n from "../../shared/i18n/config";
import { useSettingsStore } from "./store";
import { VoicePreview } from "./VoicePreview";

describe("voice preview", () => {
  let sample: {
    paused: boolean;
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    await i18n.changeLanguage("en");
    useSettingsStore.setState({ notifyMode: "sound", voice: "male" });
    vi.stubGlobal(
      "Audio",
      class {
        paused = true;
        currentTime = 0;
        play = vi.fn(() => {
          this.paused = false;
          return Promise.resolve();
        });
        pause = vi.fn(() => {
          this.paused = true;
        });
        addEventListener = vi.fn();
        removeEventListener = vi.fn();
        constructor() {
          sample = this;
        }
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const mount = () =>
    render(
      <DisplayLanguageProvider language="en">
        <VoicePreview />
      </DisplayLanguageProvider>,
    );

  it("stops the sample and restores the play control when sound is muted", async () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Try the voice" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(sample.paused).toBe(false);
    expect(screen.getByRole("button", { name: "Stop" })).toBeVisible();
    act(() => useSettingsStore.getState().toggleNotifyFlag("sound"));
    expect(sample.paused).toBe(true);
    expect(screen.getByRole("button", { name: "Try the voice" })).toBeVisible();
  });

  it("does not report a playback error when a pending preview is canceled by mute", async () => {
    mount();
    let rejectPlay: (reason: unknown) => void = () => {};
    sample.play.mockImplementationOnce(() => {
      sample.paused = false;
      return new Promise<void>((_resolve, reject) => {
        rejectPlay = reject;
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Try the voice" }));
    act(() => useSettingsStore.getState().toggleNotifyFlag("sound"));
    await act(async () => {
      rejectPlay(new DOMException("canceled", "AbortError"));
    });
    expect(sample.paused).toBe(true);
    expect(screen.getByRole("button", { name: "Try the voice" })).toBeVisible();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("allows auditioning a voice while guidance is off, and canceling before play resolves", async () => {
    useSettingsStore.setState({ notifyMode: "none" });
    mount();
    let resolvePlay: () => void = () => {};
    sample.play.mockImplementationOnce(() => {
      sample.paused = false;
      return new Promise<void>((resolve) => {
        resolvePlay = resolve;
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Try the voice" }));
    expect(sample.paused).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    await act(async () => {
      resolvePlay();
    });
    expect(sample.paused).toBe(true);
    expect(screen.getByRole("button", { name: "Try the voice" })).toBeVisible();
  });
});
