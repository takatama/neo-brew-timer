import type { AudioTrack } from "../../types";

const AUDIO_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/audio/holiday/sun/";
const ARTWORK_BASE_URL =
  "https://pub-dafc6a76fed548fc9d46bd2db7bc61b5.r2.dev/artwork/holiday/sun/";

type TrackSeed = {
  id: string;
  baseName: string;
  title: string;
  subtitle: string;
};

const HOLIDAY_SUN_CLEAR_SEEDS: TrackSeed[] = [
  { id: "holiday_sun_clear_01_piano_beautiful", baseName: "holiday_sun_clear_01_piano_beautiful", title: "Sunday Piano Beautiful", subtitle: "Sunday / Piano / Beautiful" },
  { id: "holiday_sun_clear_02_vibraphone_dreamy", baseName: "holiday_sun_clear_02_vibraphone_dreamy", title: "Sunday Vibraphone Dreamy", subtitle: "Sunday / Vibraphone / Dreamy" },
  { id: "holiday_sun_clear_03_guitar_solitary", baseName: "holiday_sun_clear_03_guitar_solitary", title: "Sunday Guitar Solitary", subtitle: "Sunday / Guitar / Solitary" },
  { id: "holiday_sun_clear_04_piano_solemn", baseName: "holiday_sun_clear_04_piano_solemn", title: "Sunday Piano Solemn", subtitle: "Sunday / Piano / Solemn" },
  { id: "holiday_sun_clear_05_vibraphone_slow", baseName: "holiday_sun_clear_05_vibraphone_slow", title: "Sunday Vibraphone Slow", subtitle: "Sunday / Vibraphone / Slow" },
  { id: "holiday_sun_clear_06_guitar_nothing", baseName: "holiday_sun_clear_06_guitar_nothing", title: "Sunday Guitar Nothing", subtitle: "Sunday / Guitar / Nothing" },
  { id: "holiday_sun_clear_07_piano_ambient", baseName: "holiday_sun_clear_07_piano_ambient", title: "Sunday Piano Ambient", subtitle: "Sunday / Piano / Ambient" },
  { id: "holiday_sun_clear_08_vibraphone_misty", baseName: "holiday_sun_clear_08_vibraphone_misty", title: "Sunday Vibraphone Misty", subtitle: "Sunday / Vibraphone / Misty" },
  { id: "holiday_sun_clear_09_guitar_meditation", baseName: "holiday_sun_clear_09_guitar_meditation", title: "Sunday Guitar Meditation", subtitle: "Sunday / Guitar / Meditation" },
  { id: "holiday_sun_clear_10_piano_gentle", baseName: "holiday_sun_clear_10_piano_gentle", title: "Sunday Piano Gentle", subtitle: "Sunday / Piano / Gentle" },
];

const toAudioTrack = (seed: TrackSeed): AudioTrack => ({
  id: seed.id,
  title: seed.title,
  subtitle: seed.subtitle,
  audioUrl: `${AUDIO_BASE_URL}${seed.baseName}.mp3`,
  artworkUrl: `${ARTWORK_BASE_URL}${seed.baseName}.webp`,
});

export const holidaySunClearTracks: AudioTrack[] = HOLIDAY_SUN_CLEAR_SEEDS.map(toAudioTrack);
