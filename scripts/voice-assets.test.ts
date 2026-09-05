import { describe, expect, it } from "vitest";
import {
  createVoiceAssetTargets,
  messages,
  voices,
} from "./voice-assets.mjs";

describe("voice asset definitions", () => {
  const targets = createVoiceAssetTargets();

  it("defines the four requested WaveNet voices", () => {
    expect(voices).toEqual({
      en: { male: "en-US-Wavenet-J", female: "en-US-Wavenet-H" },
      ja: { male: "ja-JP-Wavenet-D", female: "ja-JP-Wavenet-B" },
    });
  });

  it("defines every message and creates all 12 output targets", () => {
    expect(messages).toEqual({
      en: { first: "Let's brew", next: "Next step", done: "Done" },
      ja: {
        first: "さあ、はじめましょう",
        next: "次のステップです",
        done: "できました",
      },
    });
    expect(targets).toHaveLength(12);
    expect(new Set(targets.map(({ filename }) => filename)).size).toBe(12);
  });

  it.each(["next", "done"] as const)(
    "uses fixed countdown start offsets for %s",
    (type) => {
      const ssml = targets.find(
        (target) => target.language === "en" && target.type === type,
      )?.ssml;
      expect(ssml).toContain('begin="0s"');
      expect(ssml).toContain('begin="five.begin+1.0s"');
      expect(ssml).toContain('begin="four.begin+1.0s"');
      expect(ssml).toContain('begin="three.begin+1.0s"');
      expect(ssml).toContain('begin="two.begin+1.0s"');
      expect(ssml).toContain('begin="one.begin+1.0s"');
      expect(ssml).toMatch(/>5<.*>4<.*>3<.*>2<.*>1</s);
      expect(ssml).toContain(messages.en[type]);
    },
  );

  it("does not put a countdown in first-step SSML", () => {
    const first = targets.find(
      (target) => target.language === "ja" && target.type === "first",
    );
    expect(first?.ssml).toContain(messages.ja.first);
    expect(first?.ssml).not.toContain("<par>");
    expect(first?.ssml).not.toContain(">3<");
  });
});
