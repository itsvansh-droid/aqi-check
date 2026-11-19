import {
  buildDailySummaries,
  buildTrend,
  findBestWindow,
  formatAqi,
  formatFullLocalTime,
  getCategory,
  indiaAqiForHourly,
  pollutantMeta,
  relativeTime,
  seriesFor,
  STANDARD_LABEL,
  uvLabel,
  weatherLabel,
  windDirectionLabel,
} from '../lib/aqi'
import { useNow } from '../hooks/useAnimatedNumber'
import type { CSSProperties, ReactNode } from 'react'
import type { Location, LocationReading, Standard } from '../lib/types'
import { ErrorCard } from './ErrorCard'
import { ForecastStrip } from './ForecastStrip'
import { Gauge } from './Gauge'
import { HealthCard } from './HealthCard'
import { Pollutants } from './Pollutants'
import { NowSkeleton } from './Skeletons'
import { TrendChart } from './TrendChart'
import {
  DropletIcon,
  MapPinIcon,
  RefreshIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  ThermometerIcon,
  WindIcon,
} from './Icons'

interface NowViewProps {
  location: Location
  state: {
    status: 'idle' | 'loading' | 'ready' | 'error'
    data: LocationReading | null
    error: string | null
    refreshing: boolean
    refresh: () => void
  }
  standard: Standard
  isFavorite: boolean
  onToggleFavorite: () => void
}

function HeroStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="hero-stat">
      <span className="hero-stat-icon">{icon}</span>
      <span className="hero-stat-body">
        <span className="hero-stat-label">{label}</span>
        <strong className="hero-stat-value">{value}</strong>
        <span className="hero-stat-sub">{sub}</span>
      </span>
    </div>
  )
}

export function NowView({ location, state, standard, isFavorite, onToggleFavorite }: NowViewProps) {
  const now = useNow(30_000)

  if (state.status === 'loading' && !state.data) return <NowSkeleton />

  if (state.status === 'error' || !state.data) {
    return (
      <div className="now">
        <ErrorCard
          message={state.error ?? `We couldn't load air quality for ${location.name}.`}
          onRetry={state.refresh}
        />
      </div>
    )
  }

  const { air, weather, fetchedAt } = state.data
  const current = air.current
  const india = standard === 'in' ? indiaAqiForHourly(air.hourly, current.time) : null
  const value = india
    ? india.value
    : (standard === 'us' ? current.us_aqi : current.european_aqi) ?? null
  const dominant = pollutantMeta(india?.dominant)
  const series = seriesFor(air.hourly, standard)
  const category = getCategory(value, standard)
  const trend = buildTrend(air.hourly.time, series, current.time, 24)
  const days = buildDailySummaries(air.hourly.time, series, 5, current.time.slice(0, 10))
  const bestWindow = findBestWindow(trend)
  const region = [location.admin1, location.country].filter(Boolean).join(', ')
  const conditions = weather ? weatherLabel(weather.code) : null
  const uv = uvLabel(current.uv_index ?? null)

  return (
    <div className="now">
      <section
        className="card hero"
        style={
          {
            '--cat': category.color,
            '--cat-tint': category.tint,
          } as CSSProperties
        }
      >
        <div className="hero-gauge">
          <Gauge value={value} standard={standard} category={category} />
        </div>

        <div className="hero-body">
          <div className="hero-top">
            <span className="eyebrow">
              <MapPinIcon size={14} />
              {region || 'Your place'}
            </span>
            <div className="hero-actions">
              {conditions && (
                <span className="weather-chip" title={conditions.label}>
                  <span aria-hidden="true">{conditions.icon}</span> {conditions.label}
                </span>
              )}
              <button
                type="button"
                className={`save-button ${isFavorite ? 'is-saved' : ''}`}
                onClick={onToggleFavorite}
                aria-pressed={isFavorite}
              >
                <StarIcon size={15} filled={isFavorite} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <h1 className="hero-title">{location.name}</h1>

          <div className="hero-meta">
            <span
              className="category-pill"
              style={{
                color: category.color,
                background: category.tint,
                borderColor: `${category.color}40`,
              }}
            >
              <span className="category-pill-dot" style={{ background: category.color }} />
              {category.label}
            </span>
            <span className="hero-time">{formatFullLocalTime(current.time)} · local</span>
            <span className="hero-updated">
              {state.refreshing ? <RefreshIcon size={12} className="spin" /> : null}
              Updated {relativeTime(fetchedAt, now)}
            </span>
          </div>

          <p className="hero-advice">{category.general}</p>

          {standard === 'in' && (
            <p className="method-note">
              <strong>CPCB method</strong> · 24h averages for PM₂.₅, PM₁₀, NO₂ and SO₂; 8h for O₃ and CO
              {dominant ? ` · dominant pollutant ${dominant.symbol}` : ''}
            </p>
          )}

          <div className="hero-stats">
            <HeroStat
              icon={<ThermometerIcon size={17} />}
              label="Temperature"
              value={weather?.temperature != null ? `${Math.round(weather.temperature)}°` : '—'}
              sub={weather?.apparent != null ? `Feels like ${Math.round(weather.apparent)}°` : 'Air temperature'}
            />
            <HeroStat
              icon={<DropletIcon size={17} />}
              label="Humidity"
              value={weather?.humidity != null ? `${Math.round(weather.humidity)}%` : '—'}
              sub="Relative humidity"
            />
            <HeroStat
              icon={<WindIcon size={17} />}
              label="Wind"
              value={
                weather?.windSpeed != null
                  ? `${Math.round(weather.windSpeed)} ${weather.windUnit}`
                  : '—'
              }
              sub={
                weather?.windDirection != null
                  ? `From ${windDirectionLabel(weather.windDirection)}`
                  : 'Wind speed'
              }
            />
            <HeroStat
              icon={<SunIcon size={17} />}
              label="UV index"
              value={current.uv_index != null ? current.uv_index.toFixed(1) : '—'}
              sub={uv.label}
            />
          </div>
        </div>
      </section>

      <div className="now-grid">
        <section className="card panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>Hourly forecast</h2>
              <p>Next 24 hours in local time, from the current hour.</p>
            </div>
            <span
              className="chip"
              style={{
                color: category.color,
                background: category.tint,
                borderColor: `${category.color}40`,
              }}
            >
              {formatAqi(value, standard)} {STANDARD_LABEL[standard]}
            </span>
          </div>
          <TrendChart points={trend} standard={standard} />
        </section>

        <HealthCard category={category} standard={standard} bestWindow={bestWindow} />
      </div>

      <Pollutants current={current} />

      <ForecastStrip days={days} standard={standard} />

      {bestWindow && (
        <div className="insight-banner">
          <SparklesIcon size={18} />
          <p>
            The calmest air in the next 24 hours is around{' '}
            <strong>{bestWindow.start.slice(11, 16)}–{bestWindow.end.slice(11, 16)}</strong> local time,
            with an average {STANDARD_LABEL[standard]} of <strong>{bestWindow.avg}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
