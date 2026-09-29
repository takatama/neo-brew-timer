import { create } from "zustand";
interface SessionStore {
  beans: number;
  setBeans: (beans: number) => void;
}

export function normalizeBeans(beans: number): number {
  return Number.isFinite(beans)
    ? Math.min(100, Math.max(1, Math.round(beans)))
    : 20;
}
function loadBeans(): number {
  try {
    const saved = localStorage.getItem("neo-brew-beans");
    return saved === null ? 20 : normalizeBeans(Number(saved));
  } catch {
    return 20;
  }
}

export const useSessionStore = create<SessionStore>((set) => ({
  beans: loadBeans(),
  setBeans: (value) => {
    const beans = normalizeBeans(value);
    try {
      localStorage.setItem("neo-brew-beans", String(beans));
    } catch {
      /* Storage is optional. */
    }
    set({ beans });
  },
}));
