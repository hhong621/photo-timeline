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

type TimeScrubberProps = {
  scrollRatio: number
  readScrollRatio: () => number
  onScrub: (ratio: number, commit?: boolean, smooth?: boolean) => void
  onDragActive?: (active: boolean) => void
  photos: Photo[]
}

export function TimeScrubber({
  scrollRatio,
  readScrollRatio,
  onScrub,
  onDragActive,
  photos,
}: TimeScrubberProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ pointerX: 0, translateX: 0 })
  const metricsRef = useRef({ viewportWidth: 0, contentWidth: 0 })

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

  useLayoutEffect(() => {
    if (draggingRef.current) return
    if (contentWidth <= 0) return
    setBandTranslate(translateX)
  }, [contentWidth, setBandTranslate, translateX])

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

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (contentWidth <= 0) return

      const liveRatio = readScrollRatio()
      const startTranslate = translateFromRatio(liveRatio)

      draggingRef.current = true
      event.currentTarget.setAttribute('data-dragging', '')
      setBandTranslate(startTranslate)
      dragStartRef.current = {
        pointerX: event.clientX,
        translateX: startTranslate,
      }

      onDragActive?.(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [contentWidth, onDragActive, readScrollRatio, setBandTranslate, translateFromRatio],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!draggingRef.current) return
      const dx = event.clientX - dragStartRef.current.pointerX
      const nextTranslate = dragStartRef.current.translateX + dx
      setBandTranslate(nextTranslate)
      onScrub(ratioFromTranslate(nextTranslate), false)
    },
    [onScrub, ratioFromTranslate, setBandTranslate],
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
      const nextTranslate = dragStartRef.current.translateX + dx
      const ratio = ratioFromTranslate(nextTranslate)
      const snapped = nearestSnapRatio(bounds.snapRatios, ratio)

      setBandTranslate(nextTranslate)
      onScrub(ratio, true, false)
      draggingRef.current = false
      onDragActive?.(false)
      onScrub(snapped, true, true)
    },
    [
      bounds.snapRatios,
      contentWidth,
      onDragActive,
      onScrub,
      ratioFromTranslate,
      setBandTranslate,
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