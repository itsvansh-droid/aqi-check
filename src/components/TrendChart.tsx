import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import type { TrendPoint } from '../lib/aqi'
import { getCategory, hourLabel, SCALE_MAX, STANDARD_LABEL } from '../lib/aqi'
import type { Standard } from '../lib/types'
import { useMeasure } from '../hooks/useMeasure'

interface TrendChartProps {
  points: TrendPoint[]
  standard: Standard
}

const HEIGHT = 236
const PAD = { top: 22, right: 42, bottom: 30, left: 8 }

function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return path
}

export function TrendChart({ points, standard }: TrendChartProps) {
  const [containerRef, width] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)

  const chartWidth = width || 680
  const innerWidth = Math.max(10, chartWidth - PAD.left - PAD.right)
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const scaleMax = SCALE_MAX[standard]

  const { yMax, coordinates, line, area, thresholds } = useMemo(() => {
    const peak = points.reduce((max, point) => Math.max(max, point.value), 0)
    const step = standard === 'in' ? 100 : standard === 'us' ? 50 : 20
    const floor = standard === 'in' ? 200 : standard === 'us' ? 100 : 40
    const ceiling = Math.max(floor, peak)
    const computedMax = Math.min(scaleMax, Math.ceil(ceiling / step) * step) || step
    const maxValue = peak > scaleMax ? Math.ceil(peak / step) * step : computedMax

    const toX = (index: number) =>
      PAD.left + (points.length <= 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth)
    const toY = (value: number) =>
      PAD.top + innerHeight - (Math.min(value, maxValue) / maxValue) * innerHeight

    const coords = points.map((point, index) => ({
      x: toX(index),
      y: toY(point.value),
      point,
    }))

    const linePath = smoothPath(coords)
    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x} ${PAD.top + innerHeight} L ${coords[0].x} ${
            PAD.top + innerHeight
          } Z`
        : ''

    const guideValues = Array.from({ length: 6 }, (_, index) => (index + 1) * step).filter(
      (value) => value <= maxValue,
    )

    return {
      yMax: maxValue,
      coordinates: coords,
      line: linePath,
      area: areaPath,
      thresholds: guideValues,
    }
  }, [points, innerWidth, innerHeight, standard, scaleMax])

  useEffect(() => {
    setHover(null)
  }, [points])

  const active = hover != null ? coordinates[hover] : null
  const activeCategory = active ? getCategory(active.point.value, standard) : null
  const current = points[0]
  const currentCategory = current ? getCategory(current.value, standard) : null
  const high = points.reduce((max, point) => Math.max(max, point.value), 0)
  const low = points.reduce((min, point) => Math.min(min, point.value), points[0]?.value ?? 0)
  const summary = points.length
    ? `Air quality forecast for the next ${points.length} hours. Low ${Math.round(low)}, high ${Math.round(high)}.`
    : 'No forecast available.'

  const tickIndices = useMemo(() => {
    if (points.length === 0) return []
    const candidates = [0, 6, 12, 18, points.length - 1].filter((index) => index < points.length)
    return [...new Set(candidates)]
  }, [points.length])

  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (points.length === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const localX = event.clientX - rect.left
    const ratio = Math.min(1, Math.max(0, (localX - PAD.left) / innerWidth))
    const index = Math.round(ratio * (points.length - 1))
    setHover(index)
  }

  return (
    <div
      className="chart-wrap"
      ref={containerRef}
      onPointerMove={handlePointer}
      onPointerLeave={() => setHover(null)}
      onPointerDown={handlePointer}
    >
      <svg
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${chartWidth} ${HEIGHT}`}
        className="chart"
        role="img"
        aria-label={summary}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={currentCategory?.color ?? '#38bdf8'} stopOpacity="0.34" />
            <stop offset="70%" stopColor={currentCategory?.color ?? '#38bdf8'} stopOpacity="0.06" />
            <stop offset="100%" stopColor={currentCategory?.color ?? '#38bdf8'} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={currentCategory?.color ?? '#38bdf8'} />
            <stop offset="100%" stopColor={getCategory(high, standard).color} />
          </linearGradient>
        </defs>

        {thresholds.map((value) => {
          const y = PAD.top + innerHeight - (Math.min(value, yMax) / yMax) * innerHeight
          return (
            <g key={value}>
              <line
                x1={PAD.left}
                x2={chartWidth - PAD.right}
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.14)"
                strokeDasharray="2 6"
              />
              <text x={chartWidth - PAD.right + 8} y={y + 3.5} className="chart-axis-label">
                {value}
              </text>
            </g>
          )
        })}

        {area && <path d={area} fill="url(#trend-fill)" />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke="url(#trend-line)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coordinates.length > 0 && (
          <circle
            cx={coordinates[0].x}
            cy={coordinates[0].y}
            r="4.5"
            fill={currentCategory?.color ?? '#38bdf8'}
            stroke="#0a1019"
            strokeWidth="2"
          />
        )}

        {active && (
          <g>
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD.top}
              y2={PAD.top + innerHeight}
              stroke="rgba(226,232,240,0.32)"
              strokeDasharray="3 4"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r="5"
              fill={activeCategory?.color}
              stroke="#0a1019"
              strokeWidth="2"
            />
          </g>
        )}

        {tickIndices.map((index) => {
          const x = coordinates[index]?.x
          if (x == null) return null
          return (
            <text
              key={index}
              x={x}
              y={HEIGHT - 8}
              textAnchor={index === 0 ? 'start' : index === tickIndices[tickIndices.length - 1] ? 'end' : 'middle'}
              className="chart-axis-label"
            >
              {index === 0 ? 'Now' : hourLabel(points[index].time)}
            </text>
          )
        })}
      </svg>

      {active && activeCategory && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.max(78, Math.min(chartWidth - 78, active.x)),
            top: active.y < 76 ? active.y + 16 : active.y - 14,
            transform: active.y < 76 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
        >
          <span className="chart-tooltip-time">
            {hourLabel(active.point.time)} · {getCategory(active.point.value, standard).label}
          </span>
          <span className="chart-tooltip-value" style={{ color: activeCategory.color }}>
            {Math.round(active.point.value)}
            <small> {STANDARD_LABEL[standard]}</small>
          </span>
        </div>
      )}

      <div className="chart-legend">
        <span className="chart-legend-dot" style={{ background: currentCategory?.color }} />
        {current ? `${Math.round(low)}–${Math.round(high)} over the next ${points.length}h` : 'Forecast loading'}
      </div>
    </div>
  )
}
