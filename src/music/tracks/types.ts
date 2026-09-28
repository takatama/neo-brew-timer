export type AudioTrack = {
  id: string;
  title: string;
  subtitle: string;
  audioUrl: string;
  artworkUrl: string;
};

export type BgmDayType = "weekday" | "holiday";
export type BgmDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type BgmWeather = "clear";

export type BgmContext = {
  dayType: BgmDayType;
  dayOfWeek: BgmDayOfWeek;
  weather: BgmWeather;
};
