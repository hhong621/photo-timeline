/** Web Audio oscillator waveforms used by Sound Tweak exports. */
export type SoundOscillatorType =
  | 'sine'
  | 'square'
  | 'sawtooth'
  | 'triangle'

/**
 * Playback settings from Sound Tweak “Export Last Played”.
 * `frequency` is authoritative; `note` / `octave` are for naming or triggers only.
 */
export type SoundSettings = {
  frequency: number
  oscillatorType: SoundOscillatorType
  gain: number
  duration: number
  sustainOnPress?: boolean
  useFilter?: boolean
  filterType?: BiquadFilterType
  filterFrequency?: number
  filterQ?: number
  note?: string
  octave?: number
}

export type SoundHandle = {
  release: () => void
}