import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import textToSpeech from "@google-cloud/text-to-speech";
import { createVoiceAssetTargets } from "./voice-assets.mjs";

const { TextToSpeechClient } = textToSpeech;
const outputDirectory = fileURLToPath(
  new URL("../public/assets/audio/", import.meta.url),
);
const client = new TextToSpeechClient();

async function synthesize(target) {
  const [response] = await client.synthesizeSpeech({
    input: { ssml: target.ssml },
    voice: {
      languageCode: target.voice.slice(0, 5),
      name: target.voice,
    },
    audioConfig: { audioEncoding: "LINEAR16" },
  });

  if (!response.audioContent) {
    throw new Error(`Text-to-Speech returned no audio for ${target.filename}.`);
  }
  await writeFile(
    path.join(outputDirectory, target.filename),
    response.audioContent,
  );
}

const targets = createVoiceAssetTargets();
await mkdir(outputDirectory, { recursive: true });

for (const target of targets) {
  await synthesize(target);
  console.log(`Generated ${target.filename}`);
}

console.log(`Generated ${targets.length} voice assets in ${outputDirectory}`);
