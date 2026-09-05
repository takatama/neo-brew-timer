# Neo Brew Timer

**A timer for Tetsu Kasuya's Neo Brew multi-pour drip recipe**

Neo Brew Timer is a React SPA, step-driven brewing timer designed for hands-busy coffee brewing. It guides 10 pours at a 1:15 coffee-to-water ratio, with audio/vibration support so you do not need to keep staring at the screen.

## Pages

- `/intro` – first-time intro (image, description, YouTube)
- `/setup` – beans selection and step water preview
- `/timer` – main timer UI

`/` automatically routes first-time users to Intro and returning users to Setup.

## Settings

Accessible from the header on every screen:

- Language (JA/EN)
- Notifications (sound / vibrate / none)
- Voice (male / female)
- Debug speed (x5)

Audio files live in:

```
public/assets/audio/{lang}-{voice}-{type}.wav
```

Where:

- `lang`: `ja` or `en`
- `voice`: `male` or `female`
- `type`: `first-step`, `next-step`, or `finish`

### Regenerating voice assets

Normal app development does not require Google Cloud: generated WAV files are
committed under `public/assets/audio/` and are played as offline static assets.
To regenerate all 12 language, voice, and message combinations, enable the
Google Cloud Text-to-Speech API, provide standard Application Default
Credentials, and run:

```bash
gcloud auth application-default login
npm run generate:voices
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

## Project Structure

```
src/        # React SPA source
public/     # publicDir (assets)
```

## Notes

- The timer keeps the screen awake during playback and releases the wake lock after completion.
- JSON-LD for the recipe is embedded in the root `index.html` for SEO.
