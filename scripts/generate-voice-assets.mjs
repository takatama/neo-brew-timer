import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createVoiceAssetTargets } from "./voice-assets.mjs";

const execFileAsync = promisify(execFile);
const outputDirectory = fileURLToPath(
  new URL("../public/assets/audio/", import.meta.url),
);

async function getAccessToken() {
  try {
    const { stdout } = await execFileAsync("gcloud", [
      "auth",
      "application-default",
      "print-access-token",
    ]);
    return stdout.trim();
  } catch (error) {
    throw new Error(
      "Google Cloud Application Default Credentials are unavailable. Run `gcloud auth application-default login` and try again.",
      { cause: error },
    );
  }
}

async function synthesize(target, accessToken) {
  const response = await fetch(
    "https://texttospeech.googleapis.com/v1/text:synthesize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { ssml: target.ssml },
        voice: {
          languageCode: target.voice.slice(0, 5),
          name: target.voice,
        },
        audioConfig: { audioEncoding: "LINEAR16" },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Text-to-Speech failed for ${target.filename} (${response.status}): ${await response.text()}`,
    );
  }

  const result = await response.json();
  if (typeof result.audioContent !== "string") {
    throw new Error(`Text-to-Speech returned no audio for ${target.filename}.`);
  }
  await writeFile(
    path.join(outputDirectory, target.filename),
    Buffer.from(result.audioContent, "base64"),
  );
}

const accessToken = await getAccessToken();
const targets = createVoiceAssetTargets();
await mkdir(outputDirectory, { recursive: true });

for (const target of targets) {
  await synthesize(target, accessToken);
  console.log(`Generated ${target.filename}`);
}

console.log(`Generated ${targets.length} voice assets in ${outputDirectory}`);
