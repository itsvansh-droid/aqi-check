import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** Smoothly count a numeric value up/down whenever it changes. */
export function useAnimatedNumber(target: number | null, durationMs = 900): number | null {
  const [display, setDisplay] = useState(target ?? 0)
  const displayRef = useRef(display)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    if (target == null || Number.isNaN(target)) return
    if (prefersReducedMotion() || durationMs <= 0) {
      setDisplay(target)
      return
    }

    const from = displayRef.current
    const delta = target - from
    if (delta === 0) {
      setDisplay(target)
      return
    }

    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      setDisplay(from + delta * easeOutCubic(progress))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return target == null ? null : display
}

/** Re-render on an interval so relative timestamps stay truthful. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
