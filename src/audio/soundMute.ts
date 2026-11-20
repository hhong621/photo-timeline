let soundMuted = false

export function isSoundMuted() {
  return soundMuted
}

export function setSoundMuted(muted: boolean) {
  soundMuted = muted
}