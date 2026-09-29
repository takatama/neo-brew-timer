# AGENTS.md

## Product

Neo Brew Timer guides Tetsu Kasuya's Neo Brew recipe. Read `SPEC.md` for the
current experience and `docs/redesign.md` for the design review. The primary
use case is a person holding a kettle and glancing between a phone and a scale.
Every brew screen must make current action, cumulative water target, timing,
and next action clear. Do not infer actual pouring or drawdown from timer time.

## Stack and structure

- Strict TypeScript, React 19, React Router SPA, Zustand.
- Vite, CSS Modules, shared CSS tokens, react-i18next Japanese/English JSON.
- vite-plugin-pwa for the application, twelve voice WAVs and icon cache.
- Vitest + Testing Library; three Playwright user journeys.
- Cloudflare Pages static SPA; `dist/` is the deployment output.

`src/app/routes` contains preparation, timer/completion, and an optional
introduction. `features/recipe` holds pure recipe and water calculations.
`features/settings` holds remembered preferences, a native dialog and voice
preview. `features/timer/components/BrewGuide` is the focused brew presentation;
`CoffeeReading` sits outside normal brewing. `features/timer/hooks/voiceAudio`
coordinates local audio activation. `shared/brew-timer` is the recipe-independent
timing/controller/wake-lock engine. `shared/components` contains native dialogs,
icons, illustrations, and the header. `shared/styles/tokens.css` imports the
shared theme once from main.

## Styling and accessibility

- Use CSS Modules for component styling and shared CSS variables for color,
  spacing and typography. Global layout defaults use low specificity so page
  layouts override them predictably.
- Preserve the warm paper/porcelain/forest/sage/clay language without sacrificing
  contrast or target legibility. Water numbers never interpolate or shift for
  decorative effects.
- All user-facing text lives in `shared/i18n/{ja,en}.json`.
- Native modal dialogs contain focus, support Escape and restore the trigger.
  Segmented choices support arrows. Interactive targets are at least 44px.
- Reduced motion suppresses animation; voice is optional and never the only cue.
- Keep brewing guidance and controls visible without scrolling at 320×568.
  Larger text may flow naturally; do not clip essential content.

## Timing and audio

- `useBrewTimer` owns the monotonic tick loop; derive step index from elapsed time.
- `useTimerOrchestrator` integrates recipe, URL language, notifications and
  `useBrewTimerController`. The controller owns startup/pause/reset and wake lock.
- Voice/vibration pre-notification fires exactly five seconds before a transition
  from a single callback. Audio assets already include the countdown.
- Startup delay is five seconds by default. During it the underlying timer is
  idle, so test `isStartingRef` before timer status when canceling.
- Cancel, pause, reset, mute and unmount must stop audio. Protect real playback
  from late silent warm-up resolution and from StrictMode effect replay.
- Audio and SVG/icons live in `public/`; use URL paths for static assets.
- Preferences and dose are optional local storage. Failures must not prevent
  choosing settings or starting a brew. Active brew state is in memory.
- URL language changes must retain elapsed time. Confirm leaving/resetting an
  active or paused brew, including browser Back.

## Recipe types

`WaterAmountType` supports `flavor1 | flavor2 | strength | equalPour | none`.
Keep these recipe-level strategies; current UI uses equal pours. `computeSteps`
uses an exhaustive switch with `never`. Round cumulative targets rather than
repeating a rounded increment; final water must equal dose × ratio.

## Commands and verification

```bash
npm run dev
npm run typecheck
npm run test
npm run test:e2e
npm run inspect:mobile
npm run build
npm run deploy
```

Run typecheck, Vitest and browser journeys after timer integration changes.
Report checks not run. Keep E2E thin: completion/language continuity,
pause/resume/reset/leave, and cancel/retry/small-screen fit. Use browser clock and
visible roles/labels; no real sleeps, screenshot baselines or recipe matrices.
Unit tests cover calculations, exact boundaries, storage failures and asynchronous
races. `inspect:mobile` captures the real product at seven language/size settings;
its outputs go to ignored `test-results/mobile/` by default. Use `APP_URL`,
`SCREENSHOT_DIR`, and optional `BROWSER_EXECUTABLE_PATH` to inspect a preview.

External services are isolated in tests. Verify real local audio and cached
production/offline behavior separately. Physical sound/haptics/wake lock and
background behavior require device checks. Do not activate updates mid-brew.

## PR language

PR titles and descriptions must be written in English.
