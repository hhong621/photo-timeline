import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { photos, type Photo } from './photos'

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
  const [scrollRatio, setScrollRatio] = useState(0)
  const [canScrub, setCanScrub] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const trackContentRef = useRef<HTMLDivElement>(null)

  const syncScrollRatio = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const maxScroll = track.scrollWidth - track.clientWidth
    const scrubbable = maxScroll > 1
    setCanScrub(scrubbable)
    setScrollRatio(scrubbable ? track.scrollLeft / maxScroll : 0)
  }, [])

  const scrubTimeline = useCallback(
    (ratio: number) => {
      const track = trackRef.current
      if (!track) return

      const maxScroll = track.scrollWidth - track.clientWidth
      if (maxScroll <= 0) return

      const clamped = Math.min(1, Math.max(0, ratio))
      track.scrollLeft = clamped * maxScroll
      setScrollRatio(clamped)
    },
    [],
  )

  const close = useCallback(() => setSelected(null), [])

  useEffect(() => {
    const track = trackRef.current
    const content = trackContentRef.current
    if (!track) return

    syncScrollRatio()

    const observer = new ResizeObserver(syncScrollRatio)
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
    <div className={`app${selected ? ' app--expanded' : ''}`}>
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
              Select a photo from the timeline
            </motion.p>
          </main>
          <AnimatePresence>
            {selected ? (
              <div className="expand-ui">
                <button
                  type="button"
                  className="backdrop"
                  aria-label="Close expanded photo"
                  onClick={close}
                />
                <motion.div
                  className="hero-wrap photo-shell"
                  layoutId={selected.id}
                  role="dialog"
                  aria-modal="false"
                  aria-label={selected.label}
                >
                  <PhotoFrame photo={selected} variant="hero" />
                  <button
                    type="button"
                    className="hero-close"
                    onClick={close}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>

        <footer className="timeline-shell">
        <motion.div
          ref={trackRef}
          className="timeline-track"
          layoutScroll
          role="list"
          aria-label="Photo timeline"
          onScroll={syncScrollRatio}
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
                aria-pressed={isSelected}
                aria-label={`${photo.label}, ${photo.date}`}
                whileHover={{ translateY: 'calc(-1 * var(--timeline-hover-lift))' }}
                whileTap={{ scale: 0.98 }}
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
                <span className="timeline-item__date">{photo.date}</span>
              </motion.button>
            )
          })}
          </div>
        </motion.div>
        {canScrub ? (
          <label className="timeline-scrubber-wrap">
            <span className="visually-hidden">Scrub timeline</span>
            <input
              type="range"
              className="timeline-scrubber"
              min={0}
              max={1000}
              step={1}
              value={Math.round(scrollRatio * 1000)}
              onChange={(event) =>
                scrubTimeline(Number(event.target.value) / 1000)
              }
              aria-valuetext={`${Math.round(scrollRatio * 100)} percent`}
            />
          </label>
        ) : null}
        </footer>
      </LayoutGroup>
    </div>
  )
}

export default App
