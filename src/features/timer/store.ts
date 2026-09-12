import { create } from "zustand";
import type { FlavorProfile } from "../recipe/types";

interface SessionStore {
  beans: number;
  flavor: FlavorProfile;
  introSeen: boolean;
  setBeans: (beans: number) => void;
  setFlavor: (flavor: FlavorProfile) => void;
  setIntroSeen: (seen: boolean) => void;
}

function loadIntroSeen(): boolean {
  try {
    return localStorage.getItem("brewsteps_intro_seen") === "1";
  } catch {
    return false;
  }
}

export function normalizeBeans(beans: number): number {
  return Number.isFinite(beans) ? Math.min(100, Math.max(1, Math.round(beans))) : 20;
}
function loadBeans(): number {
  try { const saved = localStorage.getItem("neo-brew-beans"); return saved === null ? 20 : normalizeBeans(Number(saved)); }
  catch { return 20; }
}

export const useSessionStore = create<SessionStore>((set) => ({
  beans: loadBeans(),
  flavor: "neutral",
  introSeen: loadIntroSeen(),
  setBeans: (value) => {
    const beans = normalizeBeans(value);
    try { localStorage.setItem("neo-brew-beans", String(beans)); } catch { /* Storage is optional. */ }
    set({ beans });
  },
  setFlavor: (flavor) => set({ flavor }),
  setIntroSeen: (seen) => {
    try {
      if (seen) localStorage.setItem("brewsteps_intro_seen", "1");
    } catch {
      // ignore
    }
    set({ introSeen: seen });
  },
}));
