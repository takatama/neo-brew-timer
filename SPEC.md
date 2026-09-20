# Neo Brew Timer experience specification

## Purpose

Support a person pouring coffee while looking between a phone and a weight-only
scale. The screen must answer: what do I do now, what should the scale read,
and what happens next? The app cannot measure pouring or detect drawdown.

## Recipe

Keep the established Neo Brew schedule: ten pours at a 1:15 ratio, starting at
0:00, 0:30, then every 15 seconds through 2:30; estimated finish at 3:30.
Water targets are cumulative. Never ask the user to zero the scale between pours.
Round cumulative targets rather than repeating a rounded increment: individual
pours differ by at most 1g, stay positive, and sum to the intended total.

## Introduction and preparation

- On the first root visit, redirect to the localized introduction (`/{lang}/intro`).
  The single primary action remembers that the introduction has been seen and
  continues to bean-amount preparation without starting a brew. On later root
  visits, open preparation directly. Explicit localized introduction, preparation
  and timer URLs remain available.
- Keep everyday setup focused on beans, total water, ratio and Start. Do not assume a cup count.
- Remember beans locally; accept whole grams from 1 through 100. This is an input
  bound, not a claim that all drippers can hold the largest batch.
- Keep the product introduction and video on the introduction page. Keep preparation
  advice, countdown explanation, the full recipe, pour schedule and equipment in
  Recipe & guide from preparation.

## Brewing

- While brewing, use a fixed hierarchy: pour count and state; current action; a large cumulative
  scale target; time to the next pour; the next target.
  Use short phase names, not repeated task instructions. Explain cumulative
  weights and zeroing in the optional guide; keep that meaning in accessible labels.
- While brewing, keep the current and next target visible and stationary. Never
  animate numbers through intermediate weights or move a weight for a preview.
- Offer a five-second preparation delay, on by default and remembered in Settings.
  When disabled, start immediately without countdown audio.
  When enabled, the initial timer view and active startup delay use a dedicated
  preparation presentation: show Starting in and a large 5-to-1 seconds value in
  the center instead of the first scale target; show Waiting to start as the state;
  hide the next-pour time and progress bar while preserving their layout height;
  and show the recipe-calculated first scale target in the Next card. Elapsed brew
  time remains 0:00. During the active delay, offer Cancel start.
- At the instant brewing starts, replace 1 second directly with the first cumulative
  target, restore the current action and next-pour timer, change the state to
  Brewing, and update the Next card to the following target. Do not insert a zero,
  START state, or wait for decorative animation to finish.
- Show Brewing or Paused. Offer Pause while running and Resume when paused.
- Show elapsed / total time; keep the graphical timeline visible at every viewport height.
- Keep controls reachable at the bottom on short screens. All essential guidance
  must also work without sound or vibration.
- Next-step text and its target remain readable above a stable card layout. During
  the startup delay and the five seconds before an upcoming pour, show the local
  hand-drawn pour illustration in that card. It previews a future action rather
  than signaling that pouring must wait until zero. Do not show it for waiting,
  switch-only, completion, or other non-pour steps. End it and update its target
  immediately when the step changes.
- Decorative animation follows timer progress but never controls timer or recipe
  transitions. Stop and release it when hidden, paused, canceled or reset; keep it
  out of the accessibility tree; and suppress it for reduced motion. The countdown
  and imminent background emphasis remain available without animation.
- Keep the existing five-second notification timing and screen wake-lock support.
  Cancel voice and vibration when canceling startup, pausing or resetting.
- Confirm reset and leaving an active/paused brew, including browser Back.
  Request the browser's own warning for reload/closing; mobile browsers may omit it.
- The last phase is labeled Final pour. Completion is a
  time estimate, not a measurement of actual drawdown.

## Completion and extras

- Clearly announce completion and offer Brew again.
- Keep coffee news collapsed. Do not request it during normal brewing.
- Music remains an optional feature, off by default for new settings.
- External news and music are not required for offline brewing.

## Accessibility and resilience

- Japanese and English include control labels and document language.
- Targets use tabular numerals; current actions have polite announcements.
- Use native modal dialogs for focus containment, Escape and focus restoration.
- Segmented choices support arrow keys. Controls have at least 44px height.
- Storage failures must not prevent choosing a bean amount or brewing.
- Preserve the timer calculation and wake-lock race protections. Test startup
  cancellation, unmount, pause/resume, rounding and notification timing separately
  from the three browser journeys.

## Offline and updates

Cache the application, local voice files, icons for offline use.
Show offline readiness on preparation after the service worker reports success.
Wait for explicit update from preparation; never activate an app update in the
middle of brewing. Initial installation needs a successful online visit.

## Known device constraints

Real sound, haptics, wake lock, background suspension and operating-system process
termination need physical phone checks. An interrupted or closed browser session
is not recovered from storage. The user must keep the brewing screen open.
