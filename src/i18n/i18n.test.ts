import { describe, expect, it } from "vitest";
import en from "./en.json";
import ja from "./ja.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  Object.entries(tree).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else flatten(value, path).forEach((v, k) => out.set(k, v));
  });
  return out;
}

const placeholders = (text: string) => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

describe("translations", () => {
  const english = flatten(en as Tree);
  const japanese = flatten(ja as Tree);

  it("have the same keys in both languages", () => {
    expect([...japanese.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it("use the same placeholders in both languages", () => {
    english.forEach((text, key) => {
      expect(placeholders(japanese.get(key) ?? ""), key).toEqual(placeholders(text));
    });
  });
});
