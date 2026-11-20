let sharedAudioContext: AudioContext | null = null
let gestureUnlockInstalled = false

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContext()
  }
  return sharedAudioContext
}

const GESTURE_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

function installGestureUnlock(ctx: AudioContext) {
  if (gestureUnlockInstalled) return
  gestureUnlockInstalled = true

  const tryResume = () => {
    if (ctx.state !== 'running') {
      void ctx.resume().then(() => {
        if (ctx.state === 'running') {
          for (const event of GESTURE_EVENTS) {
            document.removeEventListener(event, tryResume, true)
          }
          gestureUnlockInstalled = false
        }
      })
    }
  }

  for (const event of GESTURE_EVENTS) {
    document.addEventListener(event, tryResume, { capture: true })
  }
}

/**
 * Returns the shared context, installing a one-time unlock on the first user
 * gesture if the context is still suspended (browser autoplay policy).
 */
export function ensureAudioRunning(): AudioContext {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    void ctx.resume()
    installGestureUnlock(ctx)
  }
  return ctx
}