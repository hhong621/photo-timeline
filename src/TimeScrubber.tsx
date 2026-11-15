import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Photo } from './photos'
import { buildTimelineMarkers, nearestSnapRatio } from './timelineScale'

const VELOCITY_SAMPLE_MS = 100
const MIN_FLING_PX_PER_SEC = 140
const FLING_FRICTION = 4.2
const FLING_STOP_RATIO_PER_SEC = 0.015
const EDGE_SNAP_EPSILON = 1 / 1200

type VelocitySample = { x: number; t: number }

function estimatePointerVelocityPxPerSec(samples: VelocitySample[]): number {
  if (samples.length < 2) return 0

  const latest = samples[samples.length - 1]
  const cutoff = latest.t - VELOCITY_SAMPLE_MS
  const windowed = samples.filter((s) => s.t >= cutoff)
  const slice = windowed.length >= 2 ? windowed : samples.slice(-2)
  const first = slice[0]
  const last = slice[slice.length - 1]
  const dt = (last.t - first.t) / 1000
  if (dt <= 0) return 0
  return (last.x - first.x) / dt
}

type TimeScrubberProps = {
  scrollRatio: number
  readScrollRatio: () => number
  onScrub: (ratio: number, commit?: boolean, smooth?: boolean) => void
  onDragActive?: (active: boolean) => void
  abortRef?: React.MutableRefObject<(() => void) | null>
  photos: Photo[]
}

export function TimeScrubber({
  scrollRatio,
  readScrollRatio,
  onScrub,
  onDragActive,
  abortRef,
  photos,
}: TimeScrubberProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const draggingRef = useRef(false)
  const flingingRef = useRef(false)
  const flingRafRef = useRef<number | null>(null)
  const flingStateRef = useRef({ ratio: 0, ratioVelocity: 0, lastTime: 0 })
  const velocitySamplesRef = useRef<VelocitySample[]>([])
  const dragStartRef = useRef({ pointerX: 0, translateX: 0 })
  const metricsRef = useRef({ viewportWidth: 0, contentWidth: 0 })
  const gestureGenerationRef = useRef(0)

  const bounds = useMemo(() => buildTimelineMarkers(photos), [photos])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const measure = () => {
      const width = viewport.clientWidth
      setViewportWidth(width)
      const tickSpacing = 6
      const minContent = Math.max(width * 2, bounds.monthCount * tickSpacing)
      setContentWidth(minContent)
      metricsRef.current = { viewportWidth: width, contentWidth: minContent }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [bounds.monthCount])

  useEffect(() => {
    metricsRef.current = { viewportWidth, contentWidth }
  }, [viewportWidth, contentWidth])

  const translateX = viewportWidth / 2 - scrollRatio * contentWidth

  const setBandTranslate = useCallback((tx: number) => {
    if (bandRef.current) {
      bandRef.current.style.transform = `translate3d(${tx}px, 0, 0)`
    }
  }, [])

  const ratioFromTranslate = useCallback((tx: number) => {
    const { viewportWidth: vw, contentWidth: cw } = metricsRef.current
    if (cw <= 0) return 0
    const raw = (vw / 2 - tx) / cw
    return Math.min(1, Math.max(0, raw))
  }, [])

  const translateFromRatio = useCallback((ratio: number) => {
    const { viewportWidth: vw, contentWidth: cw } = metricsRef.current
    return vw / 2 - ratio * cw
  }, [])

  const clampTranslate = useCallback((tx: number) => {
    const { viewportWidth: vw, contentWidth: cw } = metricsRef.current
    const min = vw / 2 - cw
    const max = vw / 2
    return Math.min(max, Math.max(min, tx))
  }, [])

  const cancelFling = useCallback(() => {
    if (flingRafRef.current !== null) {
      cancelAnimationFrame(flingRafRef.current)
      flingRafRef.current = null
    }
    flingingRef.current = false
  }, [])

  const snapReleaseRatio = useCallback(
    (ratio: number) => {
      if (ratio <= EDGE_SNAP_EPSILON) return 0
      if (ratio >= 1 - EDGE_SNAP_EPSILON) return 1
      return nearestSnapRatio(bounds.snapRatios, ratio)
    },
    [bounds.snapRatios],
  )

  const settleToSnap = useCallback(
    (ratio: number) => {
      const snapped = snapReleaseRatio(ratio)
      onDragActive?.(false)
      if (Math.abs(snapped - ratio) < 1e-5) {
        onScrub(snapped, true, false)
        return
      }
      onScrub(snapped, true, true)
    },
    [onDragActive, onScrub, snapReleaseRatio],
  )

  const commitAfterFling = useCallback(
    (ratio: number, generation: number) => {
      if (draggingRef.current) return
      if (gestureGenerationRef.current !== generation) return
      settleToSnap(ratio)
    },
    [settleToSnap],
  )

  const commitWithSnap = useCallback(
    (ratio: number) => {
      if (draggingRef.current) return
      settleToSnap(ratio)
    },
    [settleToSnap],
  )

  const releaseControl = useCallback(() => {
    gestureGenerationRef.current += 1
    cancelFling()
    if (draggingRef.current) {
      draggingRef.current = false
    }
    onDragActive?.(false)
  }, [cancelFling, onDragActive])

  useEffect(() => {
    if (!abortRef) return
    abortRef.current = releaseControl
    return () => {
      abortRef.current = null
    }
  }, [abortRef, releaseControl])

  const startFling = useCallback(
    (ratio: number, pointerVelocityPxPerSec: number) => {
      const { contentWidth: cw } = metricsRef.current
      if (cw <= 0) {
        commitWithSnap(ratio)
        return
      }

      onDragActive?.(true)
      const ratioVelocity = -pointerVelocityPxPerSec / cw
      const generation = gestureGenerationRef.current
      flingingRef.current = true
      flingStateRef.current = {
        ratio,
        ratioVelocity,
        lastTime: performance.now(),
      }

      const step = (now: number) => {
        if (
          !flingingRef.current ||
          gestureGenerationRef.current !== generation
        ) {
          cancelFling()
          return
        }

        const state = flingStateRef.current
        const dt = Math.min(0.05, (now - state.lastTime) / 1000)
        state.lastTime = now

        const decay = Math.exp(-FLING_FRICTION * dt)
        state.ratioVelocity *= decay
        state.ratio += state.ratioVelocity * dt

        if (state.ratio <= 0) {
          state.ratio = 0
          state.ratioVelocity = 0
        } else if (state.ratio >= 1) {
          state.ratio = 1
          state.ratioVelocity = 0
        }

        setBandTranslate(translateFromRatio(state.ratio))
        onScrub(state.ratio, false)

        const stopped =
          Math.abs(state.ratioVelocity) < FLING_STOP_RATIO_PER_SEC ||
          (state.ratio <= 0 && state.ratioVelocity <= 0) ||
          (state.ratio >= 1 && state.ratioVelocity >= 0)

        if (stopped) {
          cancelFling()
          commitAfterFling(state.ratio, generation)
          return
        }

        flingRafRef.current = requestAnimationFrame(step)
      }

      flingRafRef.current = requestAnimationFrame(step)
    },
    [
      cancelFling,
      commitAfterFling,
      commitWithSnap,
      onDragActive,
      onScrub,
      setBandTranslate,
      translateFromRatio,
    ],
  )

  useEffect(() => cancelFling, [cancelFling])

  useEffect(() => {
    const stopCoast = () => {
      if (!flingingRef.current) return
      gestureGenerationRef.current += 1
      cancelFling()
      if (!draggingRef.current) {
        onDragActive?.(false)
      }
    }
    window.addEventListener('pointerdown', stopCoast, true)
    return () => window.removeEventListener('pointerdown', stopCoast, true)
  }, [cancelFling, onDragActive])

  useLayoutEffect(() => {
    if (draggingRef.current || flingingRef.current) return
    if (contentWidth <= 0) return
    setBandTranslate(translateX)
  }, [contentWidth, setBandTranslate, translateX])

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (contentWidth <= 0) return

      gestureGenerationRef.current += 1
      onDragActive?.(true)
      cancelFling()
      velocitySamplesRef.current = []

      const liveRatio = readScrollRatio()
      const startTranslate = translateFromRatio(liveRatio)
      const liveTx = clampTranslate(startTranslate)

      draggingRef.current = true
      event.currentTarget.setAttribute('data-dragging', '')
      setBandTranslate(liveTx)
      dragStartRef.current = {
        pointerX: event.clientX,
        translateX: liveTx,
      }

      onScrub(ratioFromTranslate(liveTx), true, false)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [
      cancelFling,
      clampTranslate,
      contentWidth,
      onDragActive,
      onScrub,
      ratioFromTranslate,
      readScrollRatio,
      setBandTranslate,
      translateFromRatio,
    ],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!draggingRef.current) return
      const dx = event.clientX - dragStartRef.current.pointerX
      const rawTranslate = dragStartRef.current.translateX + dx
      const nextTranslate = clampTranslate(rawTranslate)
      if (nextTranslate !== rawTranslate) {
        dragStartRef.current = {
          pointerX: event.clientX,
          translateX: nextTranslate,
        }
      }
      const now = performance.now()
      const samples = velocitySamplesRef.current
      samples.push({ x: event.clientX, t: now })
      const trimBefore = now - VELOCITY_SAMPLE_MS * 2
      while (samples.length > 2 && samples[0].t < trimBefore) {
        samples.shift()
      }
      setBandTranslate(nextTranslate)
      onScrub(ratioFromTranslate(nextTranslate), false)
    },
    [clampTranslate, onScrub, ratioFromTranslate, setBandTranslate],
  )

  const finishDrag = useCallback(
    (event: React.PointerEvent) => {
      const wasDragging = draggingRef.current
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      event.currentTarget.removeAttribute('data-dragging')

      if (!wasDragging || contentWidth <= 0) {
        draggingRef.current = false
        onDragActive?.(false)
        return
      }

      const dx = event.clientX - dragStartRef.current.pointerX
      const nextTranslate = clampTranslate(
        dragStartRef.current.translateX + dx,
      )
      const ratio = ratioFromTranslate(nextTranslate)
      let pointerVelocity = estimatePointerVelocityPxPerSec(
        velocitySamplesRef.current,
      )
      velocitySamplesRef.current = []

      if (ratio <= 0 && pointerVelocity > 0) pointerVelocity = 0
      if (ratio >= 1 && pointerVelocity < 0) pointerVelocity = 0

      setBandTranslate(nextTranslate)
      draggingRef.current = false

      if (Math.abs(pointerVelocity) >= MIN_FLING_PX_PER_SEC) {
        startFling(ratio, pointerVelocity)
        return
      }

      commitWithSnap(ratio)
    },
    [
      clampTranslate,
      commitWithSnap,
      contentWidth,
      onDragActive,
      ratioFromTranslate,
      setBandTranslate,
      startFling,
    ],
  )

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      finishDrag(event)
    },
    [finishDrag],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const step = event.shiftKey ? 0.05 : 0.02
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onScrub(Math.max(0, scrollRatio - step), true)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onScrub(Math.min(1, scrollRatio + step), true)
      } else if (event.key === 'Home') {
        event.preventDefault()
        onScrub(0, true)
      } else if (event.key === 'End') {
        event.preventDefault()
        onScrub(1, true)
      }
    },
    [onScrub, scrollRatio],
  )

  const focusYear =
    bounds.majorMarkers.findLast((m) => m.ratio <= scrollRatio)?.label ??
    bounds.majorMarkers[0]?.label ??
    ''

  return (
    <div
      ref={viewportRef}
      className="time-scrubber"
      role="slider"
      tabIndex={0}
      aria-label="Scrub timeline"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(scrollRatio * 100)}
      aria-valuetext={`${focusYear}, ${Math.round(scrollRatio * 100)}%`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="time-scrubber__playhead" aria-hidden="true" />
      <div
        ref={bandRef}
        className="time-scrubber__band"
        style={{ width: contentWidth }}
      >
        {bounds.minorMarkers.map(({ key, ratio, mid }) => (
          <span
            key={key}
            className={`time-scrubber__tick time-scrubber__tick--minor${mid ? ' time-scrubber__tick--mid' : ''}`}
            style={{ left: `${ratio * 100}%` }}
          />
        ))}
        {bounds.majorMarkers.map(({ key, ratio, label }) => (
          <div
            key={key}
            className="time-scrubber__major"
            style={{ left: `${ratio * 100}%` }}
          >
            <span className="time-scrubber__tick time-scrubber__tick--major" />
            <span className="time-scrubber__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}