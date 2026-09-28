import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/weekday/thu/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/weekday/thu/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const WEEKDAY_THU_CLEAR_SEEDS: TrackSeed[] = [
  { id: "weekday_thu_clear_01_guitar_gentle", baseName: "weekday_thu_clear_01_guitar_gentle", title: "Thursday Guitar Gentle", subtitle: "Thursday / Guitar / Gentle" },
  { id: "weekday_thu_clear_02_piano_quiet", baseName: "weekday_thu_clear_02_piano_quiet", title: "Thursday Piano Quiet", subtitle: "Thursday / Piano / Quiet" },
  { id: "weekday_thu_clear_03_bass_vintage", baseName: "weekday_thu_clear_03_bass_vintage", title: "Thursday Bass Vintage", subtitle: "Thursday / Bass / Vintage" },
  { id: "weekday_thu_clear_04_guitar_slow", baseName: "weekday_thu_clear_04_guitar_slow", title: "Thursday Guitar Slow", subtitle: "Thursday / Guitar / Slow" },
  { id: "weekday_thu_clear_05_sax_nostalgic", baseName: "weekday_thu_clear_05_sax_nostalgic", title: "Thursday Sax Nostalgic", subtitle: "Thursday / Sax / Nostalgic" },
  { id: "weekday_thu_clear_06_piano_warmchords", baseName: "weekday_thu_clear_06_piano_warmchords", title: "Thursday Piano Warmchords", subtitle: "Thursday / Piano / Warmchords" },
  { id: "weekday_thu_clear_07_bass_deep", baseName: "weekday_thu_clear_07_bass_deep", title: "Thursday Bass Deep", subtitle: "Thursday / Bass / Deep" },
  { id: "weekday_thu_clear_08_guitar_whisper", baseName: "weekday_thu_clear_08_guitar_whisper", title: "Thursday Guitar Whisper", subtitle: "Thursday / Guitar / Whisper" },
  { id: "weekday_thu_clear_09_piano_healing", baseName: "weekday_thu_clear_09_piano_healing", title: "Thursday Piano Healing", subtitle: "Thursday / Piano / Healing" },
  { id: "weekday_thu_clear_10_duo_intimate", baseName: "weekday_thu_clear_10_duo_intimate", title: "Thursday Duo Intimate", subtitle: "Thursday / Duo / Intimate" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const weekdayThuClearTracks: AudioTrack[] = WEEKDAY_THU_CLEAR_SEEDS.map(toAudioTrack);
