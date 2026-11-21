/** Control points for `--ease-out-quad` in `index.css` (Motion `ease` prop). */
export const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const

/** Control points for `--ease-out-cubic` in `index.css`. */
export const easeOutCubicBezier = [0.215, 0.61, 0.355, 1] as const

function cubicBezierComponent(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

/** Eased progress for linear input `t` ∈ [0, 1] on `--ease-out-cubic`. */
export function easeOutCubicAt(t: number) {
  const clamped = Math.min(1, Math.max(0, t))
  if (clamped <= 0) return 0
  if (clamped >= 1) return 1

  const [x1, y1, x2, y2] = easeOutCubicBezier
  let lo = 0
  let hi = 1
  let u = clamped

  for (let i = 0; i < 12; i += 1) {
    const x = cubicBezierComponent(u, 0, x1, x2, 1)
    if (x < clamped) lo = u
    else hi = u
    u = (lo + hi) / 2
  }

  return cubicBezierComponent(u, 0, y1, y2, 1)
}