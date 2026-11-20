import type { Photo } from './photos'

function dateToMs(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

function msToRatio(ms: number, minMs: number, spanMs: number) {
  if (spanMs <= 0) return 0
  return Math.min(1, Math.max(0, (ms - minMs) / spanMs))
}

export function nearestSnapRatio(points: number[], ratio: number) {
  if (points.length === 0) return ratio
  let nearest = points[0]
  let minDist = Math.abs(ratio - nearest)
  for (let i = 1; i < points.length; i += 1) {
    const dist = Math.abs(ratio - points[i])
    if (dist < minDist) {
      minDist = dist
      nearest = points[i]
    }
  }
  return nearest
}

export function buildTimelineMarkers(photos: Photo[]) {
  const times = photos.map((p) => dateToMs(p.date))
  const minMs = Math.min(...times)
  const maxMs = Math.max(...times)
  const spanMs = Math.max(maxMs - minMs, 1)

  const minYear = new Date(minMs).getFullYear()
  const maxYear = new Date(maxMs).getFullYear()
  const majorMarkers: { key: string; ratio: number; label: string }[] = []
  for (let year = minYear; year <= maxYear; year += 1) {
    const jan1 = new Date(year, 0, 1).getTime()
    majorMarkers.push({
      key: `y-${year}`,
      ratio: msToRatio(jan1, minMs, spanMs),
      label: String(year),
    })
  }

  const minorMarkers: { key: string; ratio: number; mid?: boolean }[] = []
  const minDate = new Date(minMs)
  const maxDate = new Date(maxMs)
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
  while (cursor <= end) {
    const month = cursor.getMonth()
    if (month !== 0) {
      const ms = cursor.getTime()
      if (ms >= minMs) {
        minorMarkers.push({
          key: `m-${cursor.getFullYear()}-${month}`,
          ratio: msToRatio(ms, minMs, spanMs),
          mid: month % 3 === 0,
        })
      }
    }
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const approxMonthRatio = (30.4375 * 24 * 60 * 60 * 1000) / spanMs
  const majorMinorMinGap = approxMonthRatio * 1.45
  const majorRatios = majorMarkers.map((m) => m.ratio)
  const spacedMinorMarkers = minorMarkers.filter((minor) =>
    majorRatios.every(
      (major) => Math.abs(minor.ratio - major) >= majorMinorMinGap,
    ),
  )

  const snapRatios = [
    ...majorMarkers.map((m) => m.ratio),
    ...spacedMinorMarkers.map((m) => m.ratio),
  ].sort((a, b) => a - b)

  return {
    majorMarkers,
    minorMarkers: spacedMinorMarkers,
    monthCount: spacedMinorMarkers.length + majorMarkers.length,
    snapRatios,
  }
}

export function getTimelineSnapRatios(photos: Photo[]) {
  return buildTimelineMarkers(photos).snapRatios
}

/** Month + year tick positions shown on the time scrubber band. */
export function getTimelineTickRatios(photos: Photo[]) {
  const { majorMarkers, minorMarkers } = buildTimelineMarkers(photos)
  return [
    ...majorMarkers.map((m) => m.ratio),
    ...minorMarkers.map((m) => m.ratio),
  ].sort((a, b) => a - b)
}

/** Tick ratios the playhead crossed moving from `prev` to `next` along the timeline. */
export function getCrossedTickRatios(
  prev: number,
  next: number,
  tickRatios: number[],
) {
  if (prev === next || tickRatios.length === 0) return []

  const crossed: number[] = []
  if (next > prev) {
    for (const tick of tickRatios) {
      if (tick > prev && tick <= next) crossed.push(tick)
    }
  } else {
    for (const tick of tickRatios) {
      if (tick < prev && tick >= next) crossed.push(tick)
    }
  }
  return crossed
}