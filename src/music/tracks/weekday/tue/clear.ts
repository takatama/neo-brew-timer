import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/weekday/tue/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/weekday/tue/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const WEEKDAY_TUE_CLEAR_SEEDS: TrackSeed[] = [
  { id: "weekday_tue_clear_01_guitar_relax", baseName: "weekday_tue_clear_01_guitar_relax", title: "Tuesday Guitar Relax", subtitle: "Tuesday / Guitar / Relax" },
  { id: "weekday_tue_clear_02_piano_steady", baseName: "weekday_tue_clear_02_piano_steady", title: "Tuesday Piano Steady", subtitle: "Tuesday / Piano / Steady" },
  { id: "weekday_tue_clear_03_sax_gentle", baseName: "weekday_tue_clear_03_sax_gentle", title: "Tuesday Sax Gentle", subtitle: "Tuesday / Sax / Gentle" },
  { id: "weekday_tue_clear_04_guitar_arpeggio", baseName: "weekday_tue_clear_04_guitar_arpeggio", title: "Tuesday Guitar Arpeggio", subtitle: "Tuesday / Guitar / Arpeggio" },
  { id: "weekday_tue_clear_05_trumpet_cool", baseName: "weekday_tue_clear_05_trumpet_cool", title: "Tuesday Trumpet Cool", subtitle: "Tuesday / Trumpet / Cool" },
  { id: "weekday_tue_clear_06_piano_cafe", baseName: "weekday_tue_clear_06_piano_cafe", title: "Tuesday Piano Cafe", subtitle: "Tuesday / Piano / Cafe" },
  { id: "weekday_tue_clear_07_sax_modern", baseName: "weekday_tue_clear_07_sax_modern", title: "Tuesday Sax Modern", subtitle: "Tuesday / Sax / Modern" },
  { id: "weekday_tue_clear_08_trumpet_focus", baseName: "weekday_tue_clear_08_trumpet_focus", title: "Tuesday Trumpet Focus", subtitle: "Tuesday / Trumpet / Focus" },
  { id: "weekday_tue_clear_09_piano_modest", baseName: "weekday_tue_clear_09_piano_modest", title: "Tuesday Piano Modest", subtitle: "Tuesday / Piano / Modest" },
  { id: "weekday_tue_clear_10_guitar_mellow", baseName: "weekday_tue_clear_10_guitar_mellow", title: "Tuesday Guitar Mellow", subtitle: "Tuesday / Guitar / Mellow" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const weekdayTueClearTracks: AudioTrack[] = WEEKDAY_TUE_CLEAR_SEEDS.map(toAudioTrack);
