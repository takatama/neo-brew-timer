export const languages = ["en", "ja"];
export const genders = ["male", "female"];
export const messageTypes = ["first", "next", "done"];

export const voices = {
  en: {
    male: "en-US-Wavenet-J",
    female: "en-US-Wavenet-H",
  },
  ja: {
    male: "ja-JP-Wavenet-D",
    female: "ja-JP-Wavenet-B",
  },
};

export const messages = {
  en: {
    first: "Let's brew",
    next: "Next step",
    done: "Done",
  },
  ja: {
    first: "さあ、はじめましょう",
    next: "次のステップです",
    done: "できました",
  },
};

const assetSuffixes = {
  first: "first-step",
  next: "next-step",
  done: "finish",
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function countdownSsml(message) {
  return `<speak>
  <par>
    <media xml:id="five" begin="0s">
      <speak><prosody rate="x-fast">5</prosody></speak>
    </media>
    <media xml:id="four" begin="five.begin+1.0s">
      <speak><prosody rate="x-fast">4</prosody></speak>
    </media>
    <media xml:id="three" begin="four.begin+1.0s">
      <speak><prosody rate="x-fast">3</prosody></speak>
    </media>
    <media xml:id="two" begin="three.begin+1.0s">
      <speak><prosody rate="x-fast">2</prosody></speak>
    </media>
    <media xml:id="one" begin="two.begin+1.0s">
      <speak><prosody rate="x-fast">1</prosody></speak>
    </media>
    <media begin="one.begin+1.0s">
      <speak><prosody rate="medium">${escapeXml(message)}</prosody></speak>
    </media>
  </par>
</speak>`;
}

export function createVoiceAssetTargets() {
  return languages.flatMap((language) =>
    genders.flatMap((gender) =>
      messageTypes.map((type) => ({
        language,
        gender,
        type,
        voice: voices[language][gender],
        ssml: countdownSsml(messages[language][type]),
        filename: `${language}-${gender}-${assetSuffixes[type]}.wav`,
      })),
    ),
  );
}
