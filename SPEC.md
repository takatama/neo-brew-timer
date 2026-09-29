# Neo Brew Timer experience

## Purpose

Make a coffee ritual feel unhurried. A person holding a kettle and glancing
between a phone and a scale should instantly know the current target, the next
target, and when to act. The timer cannot measure pouring or drawdown.

## Recipe

Ten pours at a 1:15 ratio: 0:00, 0:30, then every 15 seconds through 2:30.
Estimated finish: 3:30. The large number is cumulative water on the scale.
Zero the scale once after adding the coffee, before starting. Round cumulative
targets, so a 21g dose ends at exactly 315g even though its increments alternate.

## Preparation

Root opens preparation in the saved/browser language immediately. The
introduction remains available at `/{language}/intro` but never gates brewing.

A porcelain dripper illustration and restrained editorial type introduce the
ritual. Short phones omit that decoration and prioritize the brewing controls.
Use whole grams from 1 through 100, remembering the last dose. These bounds do
not imply that every dripper accommodates every batch size. Offer direct input,
1g adjustments, and 15/20/25/30g presets. Show total water, ratio, ten pours, grind,
95–96°C temperature, and an estimated 3:30 duration. Explain zeroing the scale
immediately above Start.

Voice guidance can be switched on/off and previewed before starting. The
five-second preparation delay is remembered, on by default. Recipe & guide
contains preparation, the cumulative pour schedule, the original video, and
clearly disclosed equipment affiliate links. Reading is also accessible here;
request articles only when the person opens it.

## Brewing hierarchy

1. Pour position and an explicit Ready / Starting / Brewing / Paused state.
2. Current action and the large, stationary cumulative scale target.
3. The amount to add this pour and what to do once the target is reached.
4. Seconds until the next action, alongside its target.
5. Ten compact pour markers and discreet elapsed/estimated total time.
6. Pause/resume/cancel and a secondary Reset control.

During startup, show 5→1 centrally and the first target in the next panel.
Change directly to the first target when brewing begins. Never interpolate water
weights or wait for decorative animations to complete. Cancel/reset returns to
the first target in Ready state; retry starts a fresh preparation countdown.

The next panel warms from sage to clay during the final five seconds. Its thin
track represents time left in the current interval. The ten markers represent
pour position, not a time-proportional axis. Current and next numbers keep their
positions while timing updates. Decorative motion never drives recipe timing.

The final pour keeps its final water target and says to let the water drain.
Its next label is “After this pour”, and its countdown explicitly denotes an
estimated finish. Completion repeats that remaining water should be allowed to
drain. The app never claims to have detected actual brewing progress.

Keep essential brewing guidance and controls in one viewport at 320×568 and
larger portrait sizes. Larger text can scroll naturally. Leaving or resetting an
active/paused brew requires confirmation; reload/closing requests the browser's
warning. Changing language retains time. Keep audio mute and settings in the
header. Maintain screen wake lock when supported; physical behavior needs a
phone check. Keep the page open during brewing.

## Completion and reading

A gently steaming cup replaces the dripper, with dose/water/time as a small
receipt and Brew again as the main action. Coffee articles appear directly
below completion, with three links and their sources. They are also accessible
from preparation. Articles never replace brewing guidance. Unavailable news
gets a calm empty state; offline brewing works fully. Requests have a timeout
and are canceled when the view is removed. Rotating ads, background playlists,
and public debug controls have been removed.

## Audio, accessibility, and resilience

Preserve the twelve local Japanese/English, male/female voice WAVs and five-second
cue timing. Activate audio from the Start gesture. Protect a real cue from a
late silent warm-up; stop playback when muted, canceled, paused, reset, or
unmounted. React StrictMode's effect replay must not cancel startup audio.
Preview uses its own audio element and stops on leaving/changing language/voice.

Use native dialogs for focus containment, Escape, and focus restoration. Controls
and preset buttons have 44px targets. Language and voice segments support arrow
keys. Avoid announcing countdown ticks to screen readers; announce action/state
changes politely. Use tabular numbers, high contrast, and explicit wording
alongside color. Respect reduced motion. Storage failures cannot prevent brewing.

After a successful online visit, cache the app and all voice files. App updates
wait for explicit application from preparation and never reload an active brew.
News/video need a network. Closing the browser does not preserve an active brew.

## Verification

Typecheck and Vitest cover recipe calculations, settings, timer transitions,
notification boundaries, wake-lock races, and audio activation races. Three thin
Playwright journeys exercise completion, language continuity, pause/reset,
leaving confirmation, startup cancellation, and a small-phone no-scroll check.
`npm run inspect:mobile` saves actual screenshots and asserts layout for Japanese
and English at 390×844, 320×568 and 844×390, plus reduced motion at 430×932. It
isolates external services; screenshots of news use an honest empty state.
