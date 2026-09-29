import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/holiday/sat/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/holiday/sat/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const HOLIDAY_SAT_CLEAR_SEEDS: TrackSeed[] = [
  { id: "holiday_sat_clear_01_sax_holiday", baseName: "holiday_sat_clear_01_sax_holiday", title: "Saturday Sax Holiday", subtitle: "Saturday / Sax / Holiday" },
  { id: "holiday_sat_clear_02_guitar_lazy", baseName: "holiday_sat_clear_02_guitar_lazy", title: "Saturday Guitar Lazy", subtitle: "Saturday / Guitar / Lazy" },
  { id: "holiday_sat_clear_03_flute_breezy", baseName: "holiday_sat_clear_03_flute_breezy", title: "Saturday Flute Breezy", subtitle: "Saturday / Flute / Breezy" },
  { id: "holiday_sat_clear_04_sax_humming", baseName: "holiday_sat_clear_04_sax_humming", title: "Saturday Sax Humming", subtitle: "Saturday / Sax / Humming" },
  { id: "holiday_sat_clear_05_piano_waltz", baseName: "holiday_sat_clear_05_piano_waltz", title: "Saturday Piano Waltz", subtitle: "Saturday / Piano / Waltz" },
  { id: "holiday_sat_clear_06_guitar_coffee", baseName: "holiday_sat_clear_06_guitar_coffee", title: "Saturday Guitar Coffee", subtitle: "Saturday / Guitar / Coffee" },
  { id: "holiday_sat_clear_07_flute_samba", baseName: "holiday_sat_clear_07_flute_samba", title: "Saturday Flute Samba", subtitle: "Saturday / Flute / Samba" },
  { id: "holiday_sat_clear_08_sax_bouncy", baseName: "holiday_sat_clear_08_sax_bouncy", title: "Saturday Sax Bouncy", subtitle: "Saturday / Sax / Bouncy" },
  { id: "holiday_sat_clear_09_guitar_sunny", baseName: "holiday_sat_clear_09_guitar_sunny", title: "Saturday Guitar Sunny", subtitle: "Saturday / Guitar / Sunny" },
  { id: "holiday_sat_clear_10_sax_breakfast", baseName: "holiday_sat_clear_10_sax_breakfast", title: "Saturday Sax Breakfast", subtitle: "Saturday / Sax / Breakfast" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const holidaySatClearTracks: AudioTrack[] = HOLIDAY_SAT_CLEAR_SEEDS.map(toAudioTrack);
