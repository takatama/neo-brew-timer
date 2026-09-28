# Neo Brew Timer experience specification

## Purpose

Support a person pouring coffee while glancing between a phone and a
weight-only scale, kettle in hand. At any moment the screen must answer, without
thought: what do I do now, what should the scale read, when is the next pour,
and what comes after it. The app cannot measure pouring or detect drawdown, and
never pretends to.

It should feel calm, warm and tactile — a brewing companion, not a stopwatch.

## Recipe

Tetsu Kasuya's Neo Brew: ten pours at 1:15. Bloom at 0:00, then a pour at 0:30
and every 15 seconds through 2:30; estimated finish at 3:30.

Targets are cumulative scale readings. The scale is zeroed once, with the
grounds in, and never between pours. Rounding is applied to the running total,
not to a repeated increment: pours differ by at most 1 g, stay positive and sum
to the intended water. Beans are whole grams from 1 to 100 and are remembered
on the device.

## Screens

### Prepare (`/{lang}`)

- One screen, no separate introduction. A short headline explains the app.
- The coffee amount is set with a swipeable ruler (one detent per gram, snapping
  under a needle) or − / +. It is a real slider for keyboards and screen readers.
- Water, number of pours with the per-pour amount, and total time update live.
- "Before you start" lists the three things that matter at the counter: very
  coarse grind, 95–96°C water, and zeroing the scale with the grounds in.
- Start brewing is always reachable at the bottom. The hint below it says what
  will happen (a 5-second countdown, or an immediate start).
- The Recipe sheet holds the story, how to read the numbers, the pour schedule
  for the chosen amount, equipment links (with affiliate disclosure) and the
  video (privacy-enhanced embed, loaded only when opened).
- Settings sheet: language, pour cue (voice / chime / off, with a sample),
  voice, vibration (only where supported), 5-second countdown, background music,
  and a developer 5× speed.

### Brew (`/{lang}/brew`)

The dial is the instruction. Everything else is secondary.

- **Dial number:** the cumulative scale target — what the scale should read.
  It changes only at a step boundary, exactly on time, with a quick settle
  (starting at 40% opacity so it is readable immediately). It never counts
  through intermediate weights.
- **Dial label:** the action. English: Bloom / Pour to / Last pour to / Let it
  drain. Japanese: 蒸らし / 合計 / 最後の一湯 / 落ちきるのを待つ, with まで after
  the grams.
- **Dial ring:** one tick per second of the current window (30 for the bloom,
  15 per pour, 60 for the last pour and drawdown). Lit ticks are the seconds
  left; the sweep eats them clockwise from 12 o'clock like a clock hand. The
  final five ticks — the spoken "5, 4, 3, 2, 1" — are amber, so the approach of
  the next pour is visible long before it arrives.
- **Dial face:** fills with coffee to the current target's share of the total
  water, rising with a gentle slosh and ripples when a pour begins. Text is
  drawn twice so it turns cream wherever the coffee covers it.
- **Caption:** "next in 0:12" (or "done in" for the last window), in fixed-width
  cells so it never jitters.
- **Next card:** what comes after — "Pour to 60g · +30 g". During the final five
  seconds it turns amber and says Get ready. Its height never changes.
- **Rail:** the whole brew as segments sized by duration, filling as it goes,
  with elapsed / total time.
- **Top bar:** close (confirms first), pour count, a one-tap mute for cues, and
  a music toggle when music is enabled.

States:

| State | Dial | Card | Controls |
| --- | --- | --- | --- |
| Ready | Bloom · 30g, dim ring | Before: zero the scale | Start |
| Countdown | Starting in 5…1, five amber ticks | First: Bloom with 30g | Cancel |
| Brewing | Target, ticking ring | Next / Get ready | Pause |
| Paused | "Paused", frozen liquid, muted ring | Next | Start over · Resume |
| Draining | Let it drain · 300g (15 s after the last pour began) | Next: Done ~3:30 | Pause |
| Done | The full dial tilts into the surface of a porcelain cup on a saucer, seen from a three-quarter angle, with soft steam rising | "Enjoy your coffee." + summary | Brew again |

- The finish is continuous with the brew: during the drain the face is full of
  coffee, and that same circle tilts back into the cup, so the dial you have
  been filling is revealed to be the cup.
- At the instant brewing starts, the countdown's "1" is replaced directly by the
  first target. No zero, no intermediate state.
- Pause freezes time and cues. Resuming inside a lead-in resumes the spoken
  countdown mid-way so it still lands on the step.
- Start over is only offered while paused (and confirms). Leaving an active or
  paused brew — the close button or the browser's Back — confirms first. Reload
  or close requests the browser's own warning.
- Space starts, pauses and resumes on a keyboard.
- Completion is an estimate, and the done screen says so.

## Guidance: sound, vibration, screen

- The lead-in for every step starts five seconds early and ends exactly on the
  step. Voice files say "5, 4, 3, 2, 1" then a message; the chime (generated in
  code) plays five soft ticks then a bell. Both are played through `<audio>`
  so they sound with the iPhone ringer switch on silent. Clips are held in
  memory so a resumed lead-in can start mid-way even from the offline cache.
- iOS needs a gesture per `<audio>` element, so there are exactly three
  (first / next / done), unlocked in the tap that starts or resumes the brew —
  even when cues are off — and only their sources change afterwards. Unmuting,
  switching to the chime, or a chime that is still rendering all keep working.
- Under the developer 5× speed, only the tail of each lead-in plays, so it
  still ends on the step.
- Vibration: a short tap at each lead-in, a double pulse at each step, a longer
  pattern at the finish. Only offered where the browser supports it.
- Background music, when on, is ducked while a cue plays (where the browser
  allows volume changes).
- The screen is kept awake from the countdown until the brew ends or pauses.
- All guidance also works with sound and vibration off.

## Accessibility and resilience

- Japanese and English throughout, including document language and labels.
- The dial is decorative for assistive tech; a text alternative states the
  action, the target ("Scale should read 90 grams in total") and the time. A
  polite live region announces each step, the five-second heads-up, pause and
  completion — not every second.
- Native modal dialogs for focus containment, Escape and focus restoration.
  Segmented controls support arrow keys. Touch targets are at least 44 px.
- Text meets WCAG AA contrast in light and dark mode.
- Reduced motion: no liquid drift, slosh, ripples, halo, settle or tilt, and the
  steam stands still; the level jumps. All information remains.
- Time is derived from a wall-clock anchor, so a throttled or suspended page
  catches up exactly; a long gap does not replay a burst of stale cues.
- Storage failures never prevent choosing an amount or brewing.

## Offline and updates

The app shell, the display font, voice files and icons are precached. The first
visit needs a connection; afterwards brewing works offline. "Ready to brew
offline" appears once on Prepare. Updates are offered only on Prepare and never
activate mid-brew. Music and the video need a connection.

## Known device constraints

Real sound, haptics, wake lock, background suspension and process termination
need physical phone checks. An interrupted or closed browser session is not
recovered. Keep the brewing screen open.
