import type { SoundSettings } from './types'

/** F5 — thumbnail release tick (Sound Tweak export). */
export const f5: SoundSettings = {
  frequency: 698.46,
  oscillatorType: 'sine',
  useFilter: true,
  filterType: 'highpass',
  filterFrequency: 34,
  filterQ: 3.2,
  gain: 0.3,
  duration: 0.01,
  sustainOnPress: false,
  note: 'F',
  octave: 5,
}

/** Playhead tick (Sound Tweak export). */
export const timelineTick: SoundSettings = {
  frequency: 4000,
  oscillatorType: 'triangle',
  useFilter: true,
  filterType: 'highpass',
  filterFrequency: 5000,
  filterQ: 10.8,
  gain: 0.1,
  duration: 0.01,
  sustainOnPress: false,
}

/**
 * Named presets from Sound Tweak “Export Last Played” JSON.
 * Paste exports here, then trigger via `playSound(getAudioContext(), sounds.f5)`.
 */
export const sounds: Record<string, SoundSettings> = {
  f5,
  timelineTick,
}