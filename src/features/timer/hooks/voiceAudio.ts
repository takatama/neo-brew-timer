import type { DisplayLanguage } from "../../../shared/i18n/routing";
import type { Voice } from "../../settings/types";
export type VoiceMessage = "first" | "next" | "done";
const suffixes = {
  first: "first-step",
  next: "next-step",
  done: "finish",
} as const;
const sets = new Map<string, Record<VoiceMessage, HTMLAudioElement>>();
const operations = new WeakMap<HTMLAudioElement, number>();
function nextOperation(audio: HTMLAudioElement) {
  const token = (operations.get(audio) ?? 0) + 1;
  operations.set(audio, token);
  return token;
}
export function getVoiceAudio(language: DisplayLanguage, voice: Voice) {
  const key = `${language}:${voice}`;
  let set = sets.get(key);
  if (!set) {
    set = Object.fromEntries(
      Object.entries(suffixes).map(([message, suffix]) => {
        const audio = new Audio(
          `/assets/audio/${language}-${voice}-${suffix}.wav`,
        );
        audio.preload = "auto";
        audio.load();
        return [message, audio];
      }),
    ) as Record<VoiceMessage, HTMLAudioElement>;
    sets.set(key, set);
  }
  return set;
}
// Call from a tap, before navigation. Each real voice cue invalidates its warm-up,
// so a late play() resolution cannot pause a cue that has already started.
export function primeVoiceAudio(language: DisplayLanguage, voice: Voice) {
  for (const audio of Object.values(getVoiceAudio(language, voice))) {
    if (!audio.paused) continue;
    const token = nextOperation(audio);
    audio.volume = 0;
    void audio
      .play()
      .then(() => {
        if (operations.get(audio) !== token) return;
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      })
      .catch(() => {
        if (operations.get(audio) === token) audio.volume = 1;
      });
  }
}
export function prepareVoiceCue(audio: HTMLAudioElement) {
  nextOperation(audio);
  audio.volume = 1;
  audio.currentTime = 0;
}
export function stopVoiceAudio() {
  for (const set of sets.values())
    for (const audio of Object.values(set)) {
      nextOperation(audio);
      audio.pause();
      audio.volume = 1;
    }
}
export function clearVoiceAudio() {
  stopVoiceAudio();
  sets.clear();
}
