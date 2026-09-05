# Shared brew timer

This folder contains the small, recipe-independent part of the coffee timer.

## Inputs and responsibilities

- The app converts its recipe into `{ timeSec, isFinish }` steps.
- `useBrewTimer` owns elapsed time, pause/resume/reset, step changes, and the five-second pre-notification.
- `useBrewTimerController` owns the optional startup delay, preview step index, and wake-lock calls.
- The app supplies notification functions. It still owns audio files, vibration settings, language, URL handling, recipe calculations, and navigation.
- `useWakeLock` is the browser boundary. Unsupported or denied wake locks never stop the timer.
- `theme.css` provides common design values and basic card/choice styles. The app keeps its page layout and background.
- `TimerProgress` renders the shared progress track. The app supplies the remaining-time wording.
- `BrewStepCardFrame` places the step location, compact timeline, app-provided instruction, optional app-provided animation preview, and countdown in one main card.
- `TimerTimeline` draws steps from their actual times. It does not assume a recipe or fixed number of pours.

## Example

```ts
const timerSteps = recipeSteps.map((step) => ({
  timeSec: step.timeSec,
  isFinish: step.actionType === "none",
}));

const controller = useBrewTimerController({
  steps: timerSteps,
  speedMultiplier: debugSpeed,
  startDelayMs: animation ? 5000 : 0,
  wakeLock,
  onStart: playFirstSound,
  onPreNotify: ({ isFinish }) => playSound(isFinish),
});
```

The app builds its instruction and animation content, then passes those slots to `BrewStepCardFrame`. This keeps Switch directions, water wording, and Lottie selection outside the shared layout.

## Design notes

Keep the current action, target water amount, and time until the next action most prominent. A preview must not look like the current action. Start/pause must remain easy to find, and state must not be communicated by color alone. Supporting content stays visually secondary.

## Copying updates

The canonical source is `https://github.com/takatama/neo-brew-timer`, under `src/shared/brew-timer`. Copy the whole folder without app-specific edits. Record the exact source commit in the receiving app, then compare folders with:

```powershell
git diff --no-index -- path/to/neo/src/shared/brew-timer path/to/coco/src/shared/brew-timer
```

This is a manual copy. Changes do not synchronize automatically between apps.
