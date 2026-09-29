import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const SOURCE_ICON_PATH = resolve("public/icon.svg");
const OUTPUTS = [
  { size: 192, path: resolve("public/pwa-192x192.png") },
  { size: 512, path: resolve("public/pwa-512x512.png") },
];
const BACKGROUND_COLOR = "#f6f2e8";

async function generateIcon(sourceBuffer, size) {
  const foregroundBuffer = await sharp(sourceBuffer)
    .resize(size, size, { fit: "contain" })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([
      {
        input: foregroundBuffer,
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  const sourceBuffer = await readFile(SOURCE_ICON_PATH);

  await Promise.all(
    OUTPUTS.map(async ({ size, path }) => {
      const iconBuffer = await generateIcon(sourceBuffer, size);
      await writeFile(path, iconBuffer);
    }),
  );

  console.log(
    `Generated ${OUTPUTS.length} PWA icons with ${BACKGROUND_COLOR} background.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
