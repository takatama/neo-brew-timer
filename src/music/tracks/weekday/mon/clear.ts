import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/weekday/mon/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/weekday/mon/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const WEEKDAY_MON_CLEAR_SEEDS: TrackSeed[] = [
  { id: "weekday_mon_clear_01_piano_upbeat", baseName: "weekday_mon_clear_01_piano_upbeat", title: "Monday Piano Upbeat", subtitle: "Monday / Piano / Upbeat" },
  { id: "weekday_mon_clear_02_sax_smooth", baseName: "weekday_mon_clear_02_sax_smooth", title: "Monday Sax Smooth", subtitle: "Monday / Sax / Smooth" },
  { id: "weekday_mon_clear_03_piano_clear", baseName: "weekday_mon_clear_03_piano_clear", title: "Monday Piano Clear", subtitle: "Monday / Piano / Clear" },
  { id: "weekday_mon_clear_04_flute_bossa", baseName: "weekday_mon_clear_04_flute_bossa", title: "Monday Flute Bossa", subtitle: "Monday / Flute / Bossa" },
  { id: "weekday_mon_clear_05_guitar_warm", baseName: "weekday_mon_clear_05_guitar_warm", title: "Monday Guitar Warm", subtitle: "Monday / Guitar / Warm" },
  { id: "weekday_mon_clear_06_sax_standard", baseName: "weekday_mon_clear_06_sax_standard", title: "Monday Sax Standard", subtitle: "Monday / Sax / Standard" },
  { id: "weekday_mon_clear_07_piano_intellectual", baseName: "weekday_mon_clear_07_piano_intellectual", title: "Monday Piano Intellectual", subtitle: "Monday / Piano / Intellectual" },
  { id: "weekday_mon_clear_08_flute_breezy", baseName: "weekday_mon_clear_08_flute_breezy", title: "Monday Flute Breezy", subtitle: "Monday / Flute / Breezy" },
  { id: "weekday_mon_clear_09_guitar_swing", baseName: "weekday_mon_clear_09_guitar_swing", title: "Monday Guitar Swing", subtitle: "Monday / Guitar / Swing" },
  { id: "weekday_mon_clear_10_ensemble_bright", baseName: "weekday_mon_clear_10_ensemble_bright", title: "Monday Ensemble Bright", subtitle: "Monday / Ensemble / Bright" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const weekdayMonClearTracks: AudioTrack[] = WEEKDAY_MON_CLEAR_SEEDS.map(toAudioTrack);
