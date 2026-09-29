import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/weekday/wed/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/weekday/wed/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const WEEKDAY_WED_CLEAR_SEEDS: TrackSeed[] = [
  { id: "weekday_wed_clear_01_vibraphone_cool", baseName: "weekday_wed_clear_01_vibraphone_cool", title: "Wednesday Vibraphone Cool", subtitle: "Wednesday / Vibraphone / Cool" },
  { id: "weekday_wed_clear_02_sax_smooth", baseName: "weekday_wed_clear_02_sax_smooth", title: "Wednesday Sax Smooth", subtitle: "Wednesday / Sax / Smooth" },
  { id: "weekday_wed_clear_03_piano_light", baseName: "weekday_wed_clear_03_piano_light", title: "Wednesday Piano Light", subtitle: "Wednesday / Piano / Light" },
  { id: "weekday_wed_clear_04_flute_bossa", baseName: "weekday_wed_clear_04_flute_bossa", title: "Wednesday Flute Bossa", subtitle: "Wednesday / Flute / Bossa" },
  { id: "weekday_wed_clear_05_vibraphone_clear", baseName: "weekday_wed_clear_05_vibraphone_clear", title: "Wednesday Vibraphone Clear", subtitle: "Wednesday / Vibraphone / Clear" },
  { id: "weekday_wed_clear_06_sax_bluesy", baseName: "weekday_wed_clear_06_sax_bluesy", title: "Wednesday Sax Bluesy", subtitle: "Wednesday / Sax / Bluesy" },
  { id: "weekday_wed_clear_07_piano_slow", baseName: "weekday_wed_clear_07_piano_slow", title: "Wednesday Piano Slow", subtitle: "Wednesday / Piano / Slow" },
  { id: "weekday_wed_clear_08_flute_bright", baseName: "weekday_wed_clear_08_flute_bright", title: "Wednesday Flute Bright", subtitle: "Wednesday / Flute / Bright" },
  { id: "weekday_wed_clear_09_sax_sweet", baseName: "weekday_wed_clear_09_sax_sweet", title: "Wednesday Sax Sweet", subtitle: "Wednesday / Sax / Sweet" },
  { id: "weekday_wed_clear_10_acoustic_nature", baseName: "weekday_wed_clear_10_acoustic_nature", title: "Wednesday Acoustic Nature", subtitle: "Wednesday / Acoustic / Nature" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const weekdayWedClearTracks: AudioTrack[] = WEEKDAY_WED_CLEAR_SEEDS.map(toAudioTrack);
