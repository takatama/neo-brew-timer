# Neo Brew Timer

**A calm, voice-guided timer for Tetsu Kasuya's Neo Brew**

Neo Brew Timer guides the ten-pour, 1:15 Neo Brew recipe for hands-busy
brewing. A single dial shows what the scale should read, a ring of seconds shows
when the next pour comes (the last five in amber, matching the spoken
"5, 4, 3, 2, 1"), and the dial fills with coffee as the brew progresses.

## Pages

- `/{ja|en}` – Prepare: set the coffee amount (swipe the ruler or use − / +),
  see water, pours and time, check the three essentials, and start.
  The Recipe sheet holds the pour schedule, equipment and video.
- `/{ja|en}/brew` – Brew: the dial, what comes next, the whole-brew rail, and
  Pause / Resume / Start over.

`/` opens Prepare in the saved or browser language. Earlier URLs
(`/setup`, `/intro`, `/timer`) redirect to their new pages.

## Guidance

- **Pour cue:** voice (male or female, Japanese or English), a code-generated
  chime, or off. It starts five seconds before every pour and lands on it.
  A mute button sits in the brewing screen's top bar.
- **Vibration** where the browser supports it.
- **5-second countdown** before the bloom (on by default).
- **Background music** (off by default) is ducked under cues.
- The screen stays awake while brewing.

Voice files live in:

```
public/assets/audio/{lang}-{voice}-{type}.wav
```

Where `lang` is `ja` or `en`, `voice` is `male` or `female`, and `type` is
`first-step`, `next-step` or `finish`. Each is "5, 4, 3, 2, 1" followed by a
message on the sixth second.

### Regenerating voice assets

Normal app development does not require Google Cloud: generated WAV files are
committed under `public/assets/audio/` and are played as offline static assets.
To regenerate all 12 language, voice, and message combinations, install the
Google Cloud CLI and use a Google Cloud project with billing enabled. Cloud
Text-to-Speech may incur charges depending on usage.

```bash
# Replace YOUR_PROJECT_ID with the actual Google Cloud project ID.
gcloud config set project YOUR_PROJECT_ID
gcloud services enable texttospeech.googleapis.com
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
npm run generate:voices
```

If generation fails with a quota-project or `SERVICE_DISABLED` error, verify
the selected project, billing status, and API status:

```bash
gcloud config get-value project
gcloud billing projects describe YOUR_PROJECT_ID
gcloud services list --enabled --filter=texttospeech.googleapis.com
```

The generator keeps the WaveNet voice selection, localized messages, and SSML
countdown timing in `scripts/voice-assets.mjs`. It cannot generate files in
environments such as Codex Cloud where Google Cloud credentials are absent.

## Development (Vite)

```bash
npm install
npm run dev
```

Vite runs at:

```
http://localhost:5173/
```

## Tests

```bash
npm run typecheck
npm test
```

Vitest covers the pure core: the recipe plan and rounding for every bean amount,
the brew engine (countdown, cue timing and offsets, pause/resume, suspension
catch-up), the view model, settings migration, wake-lock races, routing and
translation parity.

The browser suite has three journeys: setup to completion; pause, leave
confirmation and start over; and cancelling the countdown on a small phone.

```bash
# One-time browser setup (also repeat after upgrading Playwright)
npx playwright install chromium
npm run test:e2e
```

Playwright builds the app and serves it at `127.0.0.1:4179`; leave that port
free. It uses a phone-sized viewport, controls browser time, turns sound off and
blocks external requests. Assertions use visible text and roles. Failed runs keep
traces in `test-results/`.

This is not phone hardware emulation. Real sound, vibration, screen wake lock,
background behaviour and offline updates need a physical phone.

In development, `__neo.seek(seconds)` in the console jumps a running brew to any
moment for visual checks.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy (Cloudflare Pages)

```bash
npm run deploy
```

Make sure your Pages project is configured to deploy the `dist/` directory.

## Notes

- JSON-LD for the recipe is embedded in `index.html` for search engines.
- The display face is Fraunces (SIL OFL), self-hosted so it works offline.

## Offline use and updates

After one online visit the app, font, voice files and icons are cached and
"Ready to brew offline" appears on Prepare. Music and the video need a
connection. Updates are offered only on Prepare, so they never reload the page
mid-brew. Closing the browser does not save an active brew.

See SPEC.md for the current experience, accessibility decisions and limitations.
There is no lint command configured; use typecheck, Vitest and the browser suite.
See [AGENTS.md](./AGENTS.md) for architecture and conventions.
