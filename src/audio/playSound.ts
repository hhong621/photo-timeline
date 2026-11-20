import { isSoundMuted } from './soundMute'
import type { SoundHandle, SoundSettings } from './types'

const GAIN_FLOOR = 0.001
const RELEASE_SECONDS = 0.06
const STOP_PADDING_SECONDS = 0.02

function peakGain(gain: number) {
  return gain > GAIN_FLOOR ? gain : GAIN_FLOOR
}

function scheduleStop(
  audioContext: AudioContext,
  oscillator: OscillatorNode,
  gain: GainNode,
  stopAt: number,
) {
  oscillator.stop(stopAt)
  oscillator.onended = () => {
    try {
      oscillator.disconnect()
      gain.disconnect()
    } catch {
      // Already torn down.
    }
  }
  const ms = Math.max(0, (stopAt - audioContext.currentTime) * 1000) + 50
  window.setTimeout(() => {
    try {
      oscillator.disconnect()
      gain.disconnect()
    } catch {
      // Already torn down.
    }
  }, ms)
}

/**
 * Plays a one-shot tone, or starts a sustained tone when `sustainOnPress` is true.
 * For sustain, call `release()` on pointer/key up for a short exponential fade-out.
 */
export function playSound(
  audioContext: AudioContext,
  settings: SoundSettings,
): SoundHandle | undefined {
  if (isSoundMuted()) return undefined

  const now = audioContext.currentTime
  const peak = peakGain(settings.gain)

  const oscillator = audioContext.createOscillator()
  oscillator.type = settings.oscillatorType
  oscillator.frequency.setValueAtTime(settings.frequency, now)

  const gain = audioContext.createGain()
  gain.gain.setValueAtTime(peak, now)

  if (settings.useFilter) {
    const filter = audioContext.createBiquadFilter()
    filter.type = settings.filterType ?? 'lowpass'
    filter.frequency.setValueAtTime(settings.filterFrequency ?? 2000, now)
    filter.Q.setValueAtTime(settings.filterQ ?? 1, now)
    oscillator.connect(filter)
    filter.connect(gain)
  } else {
    oscillator.connect(gain)
  }

  gain.connect(audioContext.destination)
  oscillator.start(now)

  if (settings.sustainOnPress) {
    let released = false
    return {
      release: () => {
        if (released) return
        released = true
        const t = audioContext.currentTime
        gain.gain.cancelScheduledValues(t)
        const current = Math.max(gain.gain.value, GAIN_FLOOR)
        gain.gain.setValueAtTime(current, t)
        gain.gain.exponentialRampToValueAtTime(GAIN_FLOOR, t + RELEASE_SECONDS)
        scheduleStop(
          audioContext,
          oscillator,
          gain,
          t + RELEASE_SECONDS + STOP_PADDING_SECONDS,
        )
      },
    }
  }

  const end = now + settings.duration
  gain.gain.exponentialRampToValueAtTime(GAIN_FLOOR, end)
  scheduleStop(audioContext, oscillator, gain, end + STOP_PADDING_SECONDS)

  return undefined
}