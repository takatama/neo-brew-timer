export interface BrewNote {
  beans: number;
  text: string;
  savedAt: number;
}

const key = "neo-brew-last-note";

export function readBrewNote(): BrewNote | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!value || !Number.isInteger(value.beans) || value.beans < 1 || value.beans > 100 ||
        typeof value.text !== "string" || !value.text.trim() ||
        !Number.isFinite(new Date(value.savedAt).getTime()) || typeof value.savedAt !== "number") return null;
    return { beans: value.beans, text: value.text, savedAt: value.savedAt };
  } catch {
    return null;
  }
}

export function saveBrewNote(beans: number, text: string): boolean {
  try {
    localStorage.setItem(key, JSON.stringify({ beans, text: text.trim(), savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}
