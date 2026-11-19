import { useEffect, useState } from 'react'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { BREAKPOINTS, formatAqi, gaugeFraction, SCALE_MAX, STANDARD_LABEL } from '../lib/aqi'
import type { AqiCategory, Standard } from '../lib/types'

interface GaugeProps {
  value: number | null
  standard: Standard
  category: AqiCategory
}

const CX = 140
const CY = 146
const R = 104
const START = 150
const SWEEP = 240
const WIDTH = 280
const HEIGHT = 208
const LENGTH = (SWEEP / 360) * 2 * Math.PI * R

function polar(angle: number, radius = R) {
  const radians = (angle * Math.PI) / 180
  return { x: CX + radius * Math.cos(radians), y: CY + radius * Math.sin(radians) }
}

const startPoint = polar(START)
const endPoint = polar(START + SWEEP)
const ARC = `M ${startPoint.x} ${startPoint.y} A ${R} ${R} 0 1 1 ${endPoint.x} ${endPoint.y}`

export function Gauge({ value, standard, category }: GaugeProps) {
  const animated = useAnimatedNumber(value, 1000)
  const [progress, setProgress] = useState(0)
  const fraction = gaugeFraction(value, standard)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(fraction))
    return () => cancelAnimationFrame(frame)
  }, [fraction])

  const display = animated == null ? '—' : formatAqi(animated, standard)
  const ticks = BREAKPOINTS[standard]
    .filter((tick) => tick > 0 && tick < SCALE_MAX[standard])
    .map((tick) => tick / SCALE_MAX[standard])

  return (
    <div className="gauge">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="gauge-svg"
        role="img"
        aria-label={`${STANDARD_LABEL[standard]} ${value == null ? 'unavailable' : Math.round(value)}. ${category.label}.`}
      >
        <defs>
          <filter id="gauge-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gauge-track" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(148,163,184,0.24)" />
            <stop offset="1" stopColor="rgba(148,163,184,0.07)" />
          </linearGradient>
        </defs>

        <path d={ARC} fill="none" stroke="url(#gauge-track)" strokeWidth="15" strokeLinecap="round" />

        <path
          className="gauge-progress"
          d={ARC}
          fill="none"
          stroke={category.color}
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH * (1 - progress)}
          filter="url(#gauge-glow)"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.6s ease' }}
        />

        {ticks.map((tick) => {
          const angle = START + tick * SWEEP
          const outer = polar(angle, R + 7)
          const inner = polar(angle, R - 7)
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#0a1019"
              strokeWidth="2.5"
              opacity="0.9"
            />
          )
        })}
      </svg>

      <div className="gauge-center">
        <div className="gauge-value" style={{ color: '#f5f9ff', textShadow: `0 0 34px ${category.color}55` }}>
          {display}
        </div>
        <div className="gauge-caption">{STANDARD_LABEL[standard]}</div>
      </div>

      <span className="gauge-min" aria-hidden="true">
        0
      </span>
      <span className="gauge-max" aria-hidden="true">
        {SCALE_MAX[standard]}
      </span>
    </div>
  )
}
