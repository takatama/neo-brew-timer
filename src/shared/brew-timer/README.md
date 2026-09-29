# Shared timer engine

The recipe-independent engine is deliberately separate from the product UI.
`useBrewTimer` owns monotonic elapsed time, pause/resume/reset, step changes,
and five-second notifications. `useBrewTimerController` owns startup countdown
and wake-lock coordination. `useWakeLock` handles the browser boundary and
pending-acquisition/unmount races. These mechanisms are covered in unit tests.

The app converts its computed recipe to `{timeSec,isFinish}` steps and supplies
audio/vibration callbacks. Product-specific cumulative targets, copy, navigation,
and visual progress live in `features/timer/components/BrewGuide` and the pages.
The former shared card slots, time-axis timeline, and progress widgets were
removed when the new brewing presentation replaced them.

`theme.css`, imported once through `shared/styles/tokens.css`, defines the warm
paper, porcelain, forest, sage, clay, typography, and shared control primitives.
