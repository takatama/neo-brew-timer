import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/weekday/fri/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/weekday/fri/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const WEEKDAY_FRI_CLEAR_SEEDS: TrackSeed[] = [
  { id: "weekday_fri_clear_01_trumpet_bright", baseName: "weekday_fri_clear_01_trumpet_bright", title: "Friday Trumpet Bright", subtitle: "Friday / Trumpet / Bright" },
  { id: "weekday_fri_clear_02_piano_happy", baseName: "weekday_fri_clear_02_piano_happy", title: "Friday Piano Happy", subtitle: "Friday / Piano / Happy" },
  { id: "weekday_fri_clear_03_sax_upbeat", baseName: "weekday_fri_clear_03_sax_upbeat", title: "Friday Sax Upbeat", subtitle: "Friday / Sax / Upbeat" },
  { id: "weekday_fri_clear_04_trumpet_stylish", baseName: "weekday_fri_clear_04_trumpet_stylish", title: "Friday Trumpet Stylish", subtitle: "Friday / Trumpet / Stylish" },
  { id: "weekday_fri_clear_05_guitar_swing", baseName: "weekday_fri_clear_05_guitar_swing", title: "Friday Guitar Swing", subtitle: "Friday / Guitar / Swing" },
  { id: "weekday_fri_clear_06_sax_gorgeous", baseName: "weekday_fri_clear_06_sax_gorgeous", title: "Friday Sax Gorgeous", subtitle: "Friday / Sax / Gorgeous" },
  { id: "weekday_fri_clear_07_piano_flowing", baseName: "weekday_fri_clear_07_piano_flowing", title: "Friday Piano Flowing", subtitle: "Friday / Piano / Flowing" },
  { id: "weekday_fri_clear_08_trumpet_drive", baseName: "weekday_fri_clear_08_trumpet_drive", title: "Friday Trumpet Drive", subtitle: "Friday / Trumpet / Drive" },
  { id: "weekday_fri_clear_09_guitar_bossa", baseName: "weekday_fri_clear_09_guitar_bossa", title: "Friday Guitar Bossa", subtitle: "Friday / Guitar / Bossa" },
  { id: "weekday_fri_clear_10_ensemble_rich", baseName: "weekday_fri_clear_10_ensemble_rich", title: "Friday Ensemble Rich", subtitle: "Friday / Ensemble / Rich" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const weekdayFriClearTracks: AudioTrack[] = WEEKDAY_FRI_CLEAR_SEEDS.map(toAudioTrack);
