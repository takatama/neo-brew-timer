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

## Preparation

- Open directly on preparation, including the first visit.
- Keep everyday setup focused on beans, total water, ratio and Start. Do not assume a cup count.
- Remember beans locally; accept whole grams from 1 through 100. This is an input
  bound, not a claim that all drippers can hold the largest batch.
- Keep the product introduction, preparation advice, countdown explanation,
  full recipe, pour schedule, video and equipment behind Recipe & guide.
  It starts collapsed on every visit and remains available without a first-run gate.
  Do not load the embedded video before the disclosure is opened.
- The legacy intro URL remains available, but is no longer a required first step.

## Brewing

- Use a fixed hierarchy: pour count and state; current action; a large cumulative
  scale target; time to the next pour; the next target.
  Use short phase names, not repeated task instructions. Explain cumulative
  weights and zeroing in the optional guide; keep that meaning in accessible labels.
- Keep the current and next target visible and stationary. Never animate numbers
  through intermediate weights, hide the current target, or move it for a preview.
- Offer a five-second preparation delay, on by default and remembered in Settings.
  When disabled, start immediately without countdown audio.
  Explicitly show the countdown and offer Cancel start.
- Show Brewing or Paused. Offer Pause while running and Resume when paused.
- Show elapsed / total time; keep the graphical timeline visible at every viewport height.
- Keep controls reachable at the bottom on short screens. All essential guidance
  must also work without sound or vibration.
- Next-step text is always present; no illustration or overlay state is needed.
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
