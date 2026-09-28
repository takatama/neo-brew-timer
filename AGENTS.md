# AGENTS.md

## Project overview

Neo Brew Timer guides Tetsu Kasuya's Neo Brew recipe: ten pours at 1:15 with
cumulative scale targets and a spoken or chimed five-second lead-in to each
pour. See `SPEC.md` for the experience specification.

## Tech stack

- TypeScript (strict), React 19, React Router data router (SPA)
- Zustand for settings (persisted) and the live brew state
- react-i18next with `src/i18n/{en,ja}.json`
- CSS Modules plus global tokens in `src/styles/global.css`
- Vite 8 with vite-plugin-pwa; Fraunces (self-hosted, Latin subset) for numerals
- Vitest + Testing Library; three Playwright journeys
- Cloudflare Pages (static SPA)

## Structure

```
src/
├── main.tsx                 # language bootstrap, font wait, render
├── app/App.tsx              # router, language provider, error boundary
├── pages/
│   ├── PreparePage.tsx      # dose ruler, plan summary, start
│   └── BrewPage.tsx         # dial, next card, rail, controls, dialogs
├── brew/
│   ├── recipe.ts            # Neo Brew definition → BrewPlan (pure)
│   ├── engine.ts            # framework-free clock: status, cues (pure logic)
│   ├── view.ts              # (plan, status, time) → what the screen says (pure)
│   ├── session.ts           # the one live brew: engine + cues + wake lock + store
│   └── wakeLock.ts          # screen wake lock with race protection
├── cues/
│   ├── clips.ts             # <audio> clip player: unlock, offset playback
│   ├── chime.ts             # code-generated chime clips (OfflineAudioContext → WAV)
│   └── index.ts             # engine cue → sound / vibration, per settings
├── settings/                # persisted settings, bean amount, settings sheet
├── guide/                   # recipe sheet, Amazon links
├── music/                   # optional background music (player + track data)
├── i18n/                    # config, routing, translations
├── ui/                      # Dial, DoseRuler, PourRail, Sheet, controls, icons
└── styles/global.css        # tokens (light + dark), font, reset
```

## Architecture rules

- **Time has one owner.** `BrewEngine` derives elapsed time from a wall-clock
  anchor (`Date.now()`), never by summing ticks. Everything else reads it.
- **Pure core.** `recipe.ts`, `engine.ts` and `view.ts` have no React or DOM
  dependencies and carry the unit tests. Add behaviour there first.
- **The session lives outside React.** `brew/session.ts` holds the single
  engine, drives cues and the wake lock, and exposes discrete view state through
  `useBrew`. Components re-render only when a visible value changes.
- **Continuous visuals paint themselves.** The dial and rail read
  `brew.progress()`, `brew.level()` and `brew.elapsedMs()` per animation frame
  and on every render (so they stay truthful when frames are throttled). They
  never drive timing.
- **Cues carry an offset.** A lead-in cue says how far into the five seconds the
  brew already is, so resumed or late cues stay aligned with the step.
- **Audio must be unlocked in a gesture.** Call `brew.start()` / `brew.resume()`
  directly from the tap handler. Clips are `<audio>` elements (not Web Audio)
  so they play with the iPhone ringer switch on silent.
- **Numbers never count.** Targets change only at step boundaries.

## Conventions

- All user-facing strings live in both `en.json` and `ja.json`; a test enforces
  identical keys and placeholders. Japanese copy should read naturally, not as a
  translation.
- Colours are tokens with light and dark values; check contrast when adding one.
- Static assets live in `public/` and are referenced by URL
  (`/assets/audio/{lang}-{voice}-{first-step|next-step|finish}.wav`).
- Settings persist under the existing `coco-timer-settings` key (version 7);
  `migrateSettings` accepts every earlier shape. Beans persist under
  `neo-brew-beans`.
- In development, `window.__neo.seek(seconds)` jumps the running brew to a
  moment for visual checks.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build → dist/
npm test             # Vitest
npm run typecheck    # TypeScript
npm run test:e2e     # three Chromium journeys (builds and serves itself)
npm run deploy       # Cloudflare Pages
```

## Testing

- Keep E2E to three journeys: setup to completion; pause, leave-confirmation
  and start over; cancelling the countdown on a small phone. Use the browser
  clock, visible text and roles; no CSS selectors or screenshot baselines.
- Timing, cue offsets, rounding, migration and wake-lock races belong in Vitest.
- Run typecheck, Vitest and E2E after changing timing, cues or the brew screen.
  Physical sound, vibration, wake lock and background behaviour need a phone.

## PR language

Write PR titles and descriptions in English.
