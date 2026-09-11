# AGENTS.md

## Project Overview

Neo Brew Timer is a brewing timer for Tetsu Kasuya's Neo Brew recipe.
See `SPEC.md` for full UI/UX specification.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **UI:** React 19, React Router (SPA)
- **State:** Zustand (settings persisted to localStorage, session state in-memory)
- **i18n:** react-i18next with JSON translation files (`src/shared/i18n/{ja,en}.json`)
- **Styling:** CSS Modules (`.module.css`) + global design tokens (`tokens.css`)
- **Build:** Vite 8, `public/` as publicDir, vite-plugin-pwa for offline support
- **Test:** Vitest + Testing Library; three Playwright smoke journeys
- **Deploy:** Cloudflare Pages (static SPA; default fallback to `/` when no top-level `404.html`)

## Project Structure

```
src/
├── app/
│   ├── App.tsx                    # BrowserRouter + Routes + ErrorBoundary
│   ├── App.module.css
│   └── routes/
│       ├── IntroPage.tsx / .module.css
│       ├── SetupPage.tsx / .module.css
│       └── TimerPage.tsx / .module.css
├── features/
│   ├── recipe/                    # Recipe types, data, water calculation (pure functions)
│   ├── settings/                  # Zustand store (localStorage persist), SettingsModal
│   │   ├── SettingsModal.tsx / .module.css
│   │   └── store.ts / types.ts
│   └── timer/
│       ├── store.ts               # Session store (beans, flavor, introSeen)
│       ├── hooks/
│       │   ├── useTimer.ts        # Tick loop, elapsed time, step detection
│       │   ├── useTimerOrchestrator.ts  # Overlay, play/pause/reset, wake lock coordination
│       │   ├── useWakeLock.ts
│       │   └── useNotification.ts
│       └── components/            # StepCard, Countdown, NextStepPreview, Timeline
│           └── *.tsx / *.module.css
└── shared/
    ├── components/                # Header, ErrorBoundary
    ├── i18n/                      # config.ts, ja.json, en.json
    └── styles/
        └── tokens.css             # Design tokens + shared primitives (card, choice, hint)
public/                            # Vite publicDir — served as-is at /
└── assets/
    ├── audio/                     # {lang}-{voice}-{type}.wav
    └── images/
```

## Key Conventions

### Styling

- **Design tokens** (CSS variables, reset, shared primitives like `.card`, `.choice`, `.hint`) are in `src/shared/styles/tokens.css` — imported once in `main.tsx`.
- **Component styles** use CSS Modules (`.module.css` co-located with each component).
- Use `import styles from "./Component.module.css"` and `className={styles.foo}`.
- Shared primitives (`card`, `card-title`, `choice`, `choice-row`, `hint`, `content`, `pour-amount`) are global classes from `tokens.css`.

### Timer Architecture

- `useTimer` hook owns the tick loop and elapsed time as the single source of truth.
- `useTimerOrchestrator` composes `useTimer` + `useWakeLock` + `useNotification` and manages the optional startup countdown, and play/pause/reset handlers.
- Current step index is derived from elapsed time (not stored separately).
- All notifications (sound and vibration) fire at exactly **5 seconds** before step transition via a single `onPreNotify` callback. There is no separate sound timing.

### Pause During Startup Countdown

- When the timer starts with `startDelay` enabled (default: true), there is a 5-second countdown before the timer actually begins ticking.
- With `startDelay` off, start immediately without playing countdown audio.
- During this countdown, `timer.status` is still `"idle"`, not `"running"`.
- `handlePlayPause` must check `startDelayRef` first (before `timer.status`) to allow canceling the countdown.

### Static Assets

- Audio and images live in `public/assets/` (Vite publicDir).
- Reference them as URL strings (e.g., `/assets/audio/ja-male-next-step.wav`), not as ES module imports.

### State Management

| Layer    | Tool                 | Persisted    | Examples                                           |
| -------- | -------------------- | ------------ | -------------------------------------------------- |
| Settings | Zustand + persist    | localStorage | language, notifyMode, voice, startDelay, debugSpeed |
| Session  | Zustand (no persist) | No           | beans, flavor, introSeen                           |
| Derived  | useMemo / computed   | No           | computedSteps, currentStepIndex, waterAmounts      |

### i18n

- All user-facing strings are in `src/shared/i18n/{ja,en}.json`.
- Use `useTranslation()` hook in components.
- For strings with embedded markup (e.g., pour amounts), use `<Trans>` component with `components` prop.
- When language changes, call both `settings.setLanguage(lang)` and `i18n.changeLanguage(lang)`.

### Type Safety

- `WaterAmountType` uses `"flavor1" | "flavor2" | "strength" | "none"` (not `null`).
- `computeSteps` uses exhaustive `switch` with `never` check on `waterAmountType`.

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build → dist/
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
npm run typecheck    # TypeScript checks
npm run test:e2e     # Three Chromium journeys (build + preview managed automatically)
npm run deploy       # Deploy to Cloudflare Pages
```

## Testing

- Keep E2E thin: `e2e/timer.spec.ts` covers only setup-to-finish, pause/resume/reset, and startup cancel/retry.
- Use Vitest for recipe combinations, exact notification timing, and pending-operation races. Do not duplicate those matrices in Playwright.
- E2E uses browser clock control and user-visible locators; avoid fixed real-time sleeps, CSS selectors, and screenshot baselines.
- External services are isolated in E2E; physical audio, vibration, wake lock, and background behavior require device checks.
- See README for browser installation and Linux cloud setup. Run typecheck, Vitest, and E2E after timer integration changes; report any unrun checks.

- `src/features/recipe/waterCalc.test.ts` — Water calculation logic (pure functions)
- `src/features/settings/store.test.ts` — Settings store (Zustand)
- `src/features/timer/hooks/useTimer.test.ts` — Timer hook (status transitions, step crossing, pre-notify)
- Settings store tests require a localStorage mock (see test file for pattern)

## PR Language

- PR titles and descriptions should be written in **English**.
