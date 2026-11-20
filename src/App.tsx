import { AnimatePresence, LayoutGroup, MotionConfig,motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { SpeakerHigh, SpeakerSlash, X } from '@phosphor-icons/react'
import { ensureAudioRunning, playSound, setSoundMuted } from './audio'
import { sounds } from './audio/sounds'
import { photos, type Photo } from './photos'
import { TimeScrubber } from './TimeScrubber'
import {
  getCrossedTickRatios,
  getTimelineSnapRatios,
  getTimelineTickRatios,
  nearestSnapRatio,
} from './timelineScale'

const SNAP_SCROLL_MS = 300
const TRACK_SNAP_IDLE_MS = 160
const EDGE_SNAP_EPSILON = 1 / 1200
const THUMB_CLICK_SLOP_PX = 8

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function formatPhotoDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function HeroMeta({
  photo,
  visible,
}: {
  photo: Photo
  visible: boolean
}) {
  const rows: { label: string; value: string }[] = [
    { label: 'Location', value: photo.location },
    { label: 'Date', value: formatPhotoDate(photo.date) },
    { label: 'Camera', value: photo.camera },
    { label: 'Focal length', value: photo.focalLength },
    { label: 'Aperture', value: photo.aperture },
    { label: 'Shutter speed', value: photo.shutterSpeed },
  ]

  return (
    <motion.aside
      className="hero-meta"
      aria-hidden={!visible}
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : 8,
      }}
      transition={
        visible
          ? { duration: 0.2, ease: 'easeOut' }
          : { duration: 0.05, ease: 'easeOut' }
      }
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <dl className="hero-meta__list">
        {rows.map(({ label, value }) => (
          <div key={label} className="hero-meta__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </motion.aside>
  )
}

function isPortraitAspect(aspectRatio: string) {
  const parts = aspectRatio.split('/').map((part) => Number(part.trim()))
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n) || n <= 0)) {
    return false
  }
  return parts[0] / parts[1] < 1
}

function PhotoFrame({
  photo,
  variant,
  useHeroSrc,
}: {
  photo: Photo
  variant: 'thumb' | 'hero'
  /** Use hero asset during shared layout animation so expansion stays sharp */
  useHeroSrc?: boolean
}) {
  const src =
    variant === 'hero' || useHeroSrc ? photo.heroSrc : photo.thumbSrc
  const portrait = isPortraitAspect(photo.aspectRatio)
  const portraitThumb = variant === 'thumb' && portrait
  const portraitHero = variant === 'hero' && portrait

  return (
    <img
      className={`photo-frame photo-frame--${variant}${portraitThumb ? ' photo-frame--thumb-portrait' : ''}${portraitHero ? ' photo-frame--hero-portrait' : ''}`}
      src={src}
      alt=""
      decoding="async"
      loading={variant === 'thumb' && !useHeroSrc ? 'lazy' : 'eager'}
      fetchPriority={variant === 'hero' ? 'high' : undefined}
      draggable={false}
      style={{ aspectRatio: photo.aspectRatio }}
    />
  )
}

function App() {
  const [selected, setSelected] = useState<Photo | null>(null)
  const [showMeta, setShowMeta] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [scrollRatio, setScrollRatio] = useState(0)
  const [canScrub, setCanScrub] = useState(false)
  const [soundMuted, setSoundMutedState] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const trackContentRef = useRef<HTMLDivElement>(null)
  const closeRequestedRef = useRef(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ignoreScrollSyncRef = useRef(false)
  const trackSnapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrubberActiveRef = useRef(false)
  const scrubberDroveRef = useRef(false)
  const scrubberAbortRef = useRef<(() => void) | null>(null)
  const trackGestureRef = useRef(0)
  const trackUserScrollRef = useRef(false)
  const snapAnimatingRef = useRef(false)
  const scrollAnimRef = useRef<number | null>(null)
  const snapRatios = useMemo(() => getTimelineSnapRatios(photos), [])
  const tickRatios = useMemo(() => getTimelineTickRatios(photos), [])
  const timelineRatioRef = useRef<number | null>(null)

  const emitTimelineRatio = useCallback(
    (ratio: number) => {
      const clamped = Math.min(1, Math.max(0, ratio))
      const prev = timelineRatioRef.current
      timelineRatioRef.current = clamped
      if (prev === null) return

      const crossed = getCrossedTickRatios(prev, clamped, tickRatios)
      if (crossed.length === 0) return

      const ctx = ensureAudioRunning()
      for (let i = 0; i < crossed.length; i += 1) {
        playSound(ctx, sounds.timelineTick)
      }
    },
    [tickRatios],
  )

  const thumbPointerRef = useRef({
    pointerId: -1,
    x: 0,
    y: 0,
  })

  const onThumbPointerDown = useCallback((event: React.PointerEvent) => {
    thumbPointerRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
  }, [])

  const onThumbPointerUp = useCallback((event: React.PointerEvent) => {
    const start = thumbPointerRef.current
    if (start.pointerId !== event.pointerId) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (dx * dx + dy * dy > THUMB_CLICK_SLOP_PX * THUMB_CLICK_SLOP_PX) return

    playSound(ensureAudioRunning(), sounds.f5)
  }, [])

  const cancelSnapAnimation = useCallback(() => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current)
      scrollAnimRef.current = null
    }
    snapAnimatingRef.current = false
  }, [])

  const readScrollRatio = useCallback(() => {
    const track = trackRef.current
    if (!track) return scrollRatio

    const maxScroll = track.scrollWidth - track.clientWidth
    if (maxScroll <= 1) return 0

    return track.scrollLeft / maxScroll
  }, [scrollRatio])

  const syncScrollRatio = useCallback((force = false) => {
    if (!force && (ignoreScrollSyncRef.current || snapAnimatingRef.current)) {
      return
    }

    const track = trackRef.current
    if (!track) return

    const maxScroll = track.scrollWidth - track.clientWidth
    const scrubbable = maxScroll > 1
    const ratio = scrubbable ? track.scrollLeft / maxScroll : 0
    setCanScrub(scrubbable)
    emitTimelineRatio(ratio)
    setScrollRatio(ratio)
  }, [emitTimelineRatio])

  const scrubTimeline = useCallback(
    (ratio: number, commit = true, smooth = false) => {
      const track = trackRef.current
      if (!track) return

      const maxScroll = track.scrollWidth - track.clientWidth
      if (maxScroll <= 0) return

      const clamped = Math.min(1, Math.max(0, ratio))
      const targetLeft = clamped * maxScroll

      if (!smooth) {
        if (scrubberActiveRef.current) {
          cancelSnapAnimation()
        }
        track.scrollLeft = targetLeft
        emitTimelineRatio(clamped)
        if (commit) {
          setScrollRatio(clamped)
        }
        if (!scrubberActiveRef.current) {
          ignoreScrollSyncRef.current = true
          requestAnimationFrame(() => {
            ignoreScrollSyncRef.current = false
          })
        }
        return
      }

      const startLeft = track.scrollLeft
      if (Math.abs(startLeft - targetLeft) < 0.5) {
        emitTimelineRatio(clamped)
        if (commit) setScrollRatio(clamped)
        return
      }

      cancelSnapAnimation()
      snapAnimatingRef.current = true
      const startedAt = performance.now()

      const step = (now: number) => {
        if (
          !snapAnimatingRef.current ||
          scrubberActiveRef.current ||
          trackUserScrollRef.current
        ) {
          snapAnimatingRef.current = false
          scrollAnimRef.current = null
          return
        }

        const elapsed = now - startedAt
        const progress = Math.min(1, elapsed / SNAP_SCROLL_MS)
        const eased = easeOutCubic(progress)
        const nextLeft = startLeft + (targetLeft - startLeft) * eased

        track.scrollLeft = nextLeft
        const frameRatio = nextLeft / maxScroll
        emitTimelineRatio(frameRatio)
        if (commit) {
          setScrollRatio(frameRatio)
        }

        if (progress < 1) {
          scrollAnimRef.current = requestAnimationFrame(step)
          return
        }

        scrollAnimRef.current = null
        snapAnimatingRef.current = false
        track.scrollLeft = targetLeft
        emitTimelineRatio(clamped)
        if (commit) {
          setScrollRatio(clamped)
        }
      }

      scrollAnimRef.current = requestAnimationFrame(step)
    },
    [cancelSnapAnimation, emitTimelineRatio],
  )

  const snapTrackToTick = useCallback(() => {
    if (
      ignoreScrollSyncRef.current ||
      scrubberActiveRef.current ||
      scrubberDroveRef.current ||
      snapAnimatingRef.current
    ) {
      return
    }

    const track = trackRef.current
    if (!track) return

    const maxScroll = track.scrollWidth - track.clientWidth
    if (maxScroll <= 1) return

    const ratio = track.scrollLeft / maxScroll
    let snapped: number
    if (ratio <= EDGE_SNAP_EPSILON) {
      snapped = 0
    } else if (ratio >= 1 - EDGE_SNAP_EPSILON) {
      snapped = 1
    } else {
      snapped = nearestSnapRatio(snapRatios, ratio)
    }
    if (Math.abs(snapped - ratio) > 1e-4) {
      scrubTimeline(snapped, true, true)
    }
  }, [scrubTimeline, snapRatios])

  const scheduleTrackSnap = useCallback(() => {
    if (trackSnapTimerRef.current) {
      clearTimeout(trackSnapTimerRef.current)
    }
    const gesture = trackGestureRef.current
    trackSnapTimerRef.current = window.setTimeout(() => {
      trackSnapTimerRef.current = null
      if (trackGestureRef.current !== gesture) return
      if (scrubberActiveRef.current || scrubberDroveRef.current) return
      snapTrackToTick()
    }, TRACK_SNAP_IDLE_MS)
  }, [snapTrackToTick])

  const onTrackScroll = useCallback(() => {
    if (scrubberActiveRef.current && !trackUserScrollRef.current) return
    if (ignoreScrollSyncRef.current) return
    if (snapAnimatingRef.current) return

    trackUserScrollRef.current = true
    scrubberDroveRef.current = false
    cancelSnapAnimation()
    if (trackSnapTimerRef.current) {
      clearTimeout(trackSnapTimerRef.current)
      trackSnapTimerRef.current = null
    }

    syncScrollRatio()
    scheduleTrackSnap()
  }, [cancelSnapAnimation, scheduleTrackSnap, syncScrollRatio])

  const interruptTimeline = useCallback(() => {
    scrubberAbortRef.current?.()
    cancelSnapAnimation()
    if (trackSnapTimerRef.current) {
      clearTimeout(trackSnapTimerRef.current)
      trackSnapTimerRef.current = null
    }
  }, [cancelSnapAnimation])

  const onTrackUserIntent = useCallback(() => {
    trackGestureRef.current += 1
    trackUserScrollRef.current = true
    scrubberDroveRef.current = false
    interruptTimeline()
  }, [interruptTimeline])

  const onTrackPointerDown = onTrackUserIntent

  const onTrackWheel = useCallback(
    (event: React.WheelEvent) => {
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY)) return
      onTrackUserIntent()
    },
    [onTrackUserIntent],
  )

  const onTimelineShellPointerDownCapture = useCallback(
    (event: React.PointerEvent) => {
      if ((event.target as HTMLElement).closest('.time-scrubber')) return
      interruptTimeline()
    },
    [interruptTimeline],
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const onScrollEnd = () => {
      if (scrubberActiveRef.current || scrubberDroveRef.current) return

      trackUserScrollRef.current = false
      const gesture = trackGestureRef.current

      if (trackSnapTimerRef.current) {
        clearTimeout(trackSnapTimerRef.current)
        trackSnapTimerRef.current = null
      }

      window.setTimeout(() => {
        if (trackGestureRef.current !== gesture) return
        if (scrubberActiveRef.current || scrubberDroveRef.current) return
        snapTrackToTick()
      }, 0)
    }

    track.addEventListener('scrollend', onScrollEnd)
    return () => {
      track.removeEventListener('scrollend', onScrollEnd)
      if (trackSnapTimerRef.current) {
        clearTimeout(trackSnapTimerRef.current)
        trackSnapTimerRef.current = null
      }
      cancelSnapAnimation()
    }
  }, [cancelSnapAnimation, snapTrackToTick])

  const commitClose = useCallback(() => {
    setSelected(null)
  }, [])

  const toggleSoundMute = useCallback(() => {
    setSoundMutedState((prev) => {
      const next = !prev
      setSoundMuted(next)
      return next
    })
  }, [])

  const close = useCallback(() => {
    closeRequestedRef.current = true
    setShowMeta(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      commitClose()
    }, 60)
  }, [commitClose])

  useEffect(() => {
    if (selected) {
      closeRequestedRef.current = false
      setStageOpen(true)
      setShowMeta(true)
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [selected?.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!selected) {
      setShowMeta(false)
    }
  }, [selected])

  const onHeroLayoutComplete = useCallback(() => {
    if (closeRequestedRef.current) {
      setStageOpen(false)
      closeRequestedRef.current = false
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    const content = trackContentRef.current
    if (!track) return

    syncScrollRatio()

    const observer = new ResizeObserver(() => syncScrollRatio())
    observer.observe(track)
    if (content) observer.observe(content)

    return () => observer.disconnect()
  }, [syncScrollRatio])

  useEffect(() => {
    if (!selected) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, close])

  return (
    <div className={`app${selected || stageOpen ? ' app--expanded' : ''}`}>
      <MotionConfig transition={{
        type: 'spring',
        stiffness: 400,
        damping: 40,
      }}>
        <LayoutGroup>
          <div className="stage-stack">
            <main className="stage" aria-live="polite">
              <motion.p
                className="stage-hint"
                aria-hidden={selected ? true : undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: selected ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                A collection of my favorite photos arranged by time
                <span className='by-line'>Made by <a href='https://hhong621.github.io/work/' target='_blank'>Harrison</a></span>
              </motion.p>
            </main>
            <div
              className={`expand-ui${selected ? ' expand-ui--active' : ''}`}
            >
              {selected ? (
                <button
                  type="button"
                  className="backdrop"
                  aria-label="Close expanded photo"
                  onClick={close}
                />
              ) : null}
              <div
                className="expand-hero"
                role={selected ? 'dialog' : undefined}
                aria-modal="false"
                aria-label={selected?.label}
                aria-hidden={selected ? undefined : true}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {selected ? (
                    <motion.div
                      key={selected.id}
                      className="hero-wrap photo-shell"
                      layoutId={selected.id}
                      onLayoutAnimationComplete={onHeroLayoutComplete}
                    >
                      <PhotoFrame photo={selected} variant="hero" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
            {selected ? (
              <div className="hero-meta-panel">
                <HeroMeta
                  key={selected.id}
                  photo={selected}
                  visible={showMeta}
                />
              </div>
            ) : null}
            {selected ? (
              <motion.button
                type="button"
                className="hero-close"
                onClick={close}
                aria-label="Close"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <X className="hero-close__icon" size={18} weight="bold" aria-hidden />
              </motion.button>
            ) : null}
          </div>

          <motion.button
            type="button"
            className="sound-mute"
            onClick={toggleSoundMute}
            aria-label={soundMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-pressed={soundMuted}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {soundMuted ? (
              <SpeakerSlash className="sound-mute__icon" size={18} weight="bold" aria-hidden />
            ) : (
              <SpeakerHigh className="sound-mute__icon" size={18} weight="bold" aria-hidden />
            )}
          </motion.button>

          <footer
            className="timeline-shell"
            onPointerDownCapture={onTimelineShellPointerDownCapture}
          >
          <motion.div
            ref={trackRef}
            className="timeline-track"
            layoutScroll
            role="list"
            aria-label="Photo timeline"
            onScroll={onTrackScroll}
            onPointerDown={onTrackPointerDown}
            onWheel={onTrackWheel}
          >
            <div ref={trackContentRef} className="timeline-track__content">
            {photos.map((photo) => {
              const isSelected = selected?.id === photo.id

              return (
                <motion.button
                  key={photo.id}
                  type="button"
                  role="listitem"
                  className={`timeline-item${isSelected ? ' timeline-item--selected' : ''}`}
                  onClick={() => setSelected(photo)}
                  onPointerDown={onThumbPointerDown}
                  onPointerUp={onThumbPointerUp}
                  aria-pressed={isSelected}
                  aria-label={`${photo.label}, ${photo.date}`}
                  whileHover={{ translateY: 'calc(-1 * var(--timeline-hover-lift))' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                  }}
                  layout={false}
                >
                  <motion.div
                    className="timeline-item__media photo-shell"
                    layoutId={photo.id}
                  >
                    <PhotoFrame
                      photo={photo}
                      variant="thumb"
                      useHeroSrc={isSelected}
                    />
                  </motion.div>
                </motion.button>
              )
            })}
            </div>
          </motion.div>
          {canScrub ? (
            <TimeScrubber
              scrollRatio={scrollRatio}
              onScrub={scrubTimeline}
              readScrollRatio={readScrollRatio}
              abortRef={scrubberAbortRef}
              onDragActive={(active) => {
                scrubberActiveRef.current = active
                if (active) {
                  scrubberDroveRef.current = true
                  ignoreScrollSyncRef.current = true
                  cancelSnapAnimation()
                  if (trackSnapTimerRef.current) {
                    clearTimeout(trackSnapTimerRef.current)
                    trackSnapTimerRef.current = null
                  }
                  return
                }
                requestAnimationFrame(() => {
                  if (!scrubberActiveRef.current) {
                    ignoreScrollSyncRef.current = false
                  }
                })
              }}
              photos={photos}
            />
          ) : null}
          </footer>
        </LayoutGroup>
      </MotionConfig>
    </div>
  )
}

export default App
