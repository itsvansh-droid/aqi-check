import { useMemo, useState } from 'react'
import { CONTINENTS, GLOBAL_CITIES } from '../lib/cities'
import {
  categoriesFor,
  flagEmoji,
  formatAqi,
  getCategory,
  getCategoryIndex,
  relativeTime,
  SCALE_MAX,
  STANDARD_LABEL,
} from '../lib/aqi'
import { useNow } from '../hooks/useAnimatedNumber'
import type { Continent, GlobalCityReading, GlobalSnapshot, Location, Standard } from '../lib/types'
import { ErrorCard } from './ErrorCard'
import { GlobalSkeleton } from './Skeletons'
import { WorldMap } from './WorldMap'
import { GlobeIcon, RefreshIcon, SearchIcon } from './Icons'

interface GlobalViewProps {
  state: {
    status: 'idle' | 'loading' | 'ready' | 'error'
    data: GlobalSnapshot | null
    error: string | null
    refreshing: boolean
  }
  standard: Standard
  onSelect: (location: Location) => void
  onRefresh: () => void
}

type SortMode = 'worst' | 'best' | 'name'
type Filter = Continent | 'World'

interface DecoratedReading {
  reading: GlobalCityReading
  value: number | null
}

function valueFor(reading: GlobalCityReading, standard: Standard): number | null {
  if (standard === 'in') return reading.indiaAqi
  return standard === 'us' ? reading.aqi : reading.euAqi
}

export function GlobalView({ state, standard, onSelect, onRefresh }: GlobalViewProps) {
  const [continent, setContinent] = useState<Filter>('World')
  const [sort, setSort] = useState<SortMode>('worst')
  const [query, setQuery] = useState('')
  const now = useNow(60_000)

  const readings = state.data?.readings ?? []
  const decorated = useMemo<DecoratedReading[]>(
    () =>
      readings.map((reading) => ({
        reading,
        value: valueFor(reading, standard),
      })),
    [readings, standard],
  )

  const stats = useMemo(() => {
    const available = decorated.filter(
      (item): item is DecoratedReading & { value: number } => item.value != null,
    )
    if (available.length === 0) return null
    const sorted = [...available].sort((a, b) => a.value - b.value)
    return {
      cleanest: sorted[0],
      dirtiest: sorted[sorted.length - 1],
      caution: available.filter((item) => getCategoryIndex(item.value, standard) >= 2).length,
      available: available.length,
    }
  }, [decorated, standard])

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()
    const filtered = decorated.filter((item) => {
      if (continent !== 'World' && item.reading.continent !== continent) return false
      if (!search) return true
      const { name, country } = item.reading.location
      return (
        name.toLowerCase().includes(search) || (country ?? '').toLowerCase().includes(search)
      )
    })

    return filtered.sort((a, b) => {
      if (sort === 'name') return a.reading.location.name.localeCompare(b.reading.location.name)
      if (a.value == null && b.value == null) return 0
      if (a.value == null) return 1
      if (b.value == null) return -1
      return sort === 'worst' ? b.value - a.value : a.value - b.value
    })
  }, [decorated, continent, query, sort])

  const header = (
    <header className="global-head">
      <div>
        <span className="eyebrow">
          <GlobeIcon size={14} /> Worldwide
        </span>
        <h1 className="page-title">Air quality around the world</h1>
        <p className="page-sub">
          Live {STANDARD_LABEL[standard]} readings from {readings.length || GLOBAL_CITIES.length} major
          cities, refreshed together. {stats ? `${stats.available} reporting right now.` : ''}
        </p>
        {standard === 'in' && (
          <p className="method-note">
            City values apply the CPCB sub-index method to live pollutant concentrations, so they are
            instantaneous estimates rather than official station averages.
          </p>
        )}
      </div>
      <div className="global-head-actions">
        {state.data && <span className="updated">Updated {relativeTime(state.data.fetchedAt, now)}</span>}
        <button
          type="button"
          className="button ghost"
          onClick={onRefresh}
          disabled={state.refreshing || state.status === 'loading'}
        >
          <RefreshIcon size={15} className={state.refreshing ? 'spin' : ''} />
          {state.refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>
    </header>
  )

  if (state.status === 'error' && !state.data) {
    return (
      <div className="global">
        {header}
        <ErrorCard
          title="The world map is unavailable"
          message={state.error ?? 'Global readings could not be loaded.'}
          onRetry={onRefresh}
        />
      </div>
    )
  }

  if (state.status === 'loading' && !state.data) {
    return (
      <div className="global">
        {header}
        <GlobalSkeleton />
      </div>
    )
  }

  return (
    <div className="global">
      {header}

      {stats && (
        <div className="stat-cards">
          <button
            type="button"
            className="card stat-card"
            onClick={() => onSelect(stats.cleanest.reading.location)}
          >
            <span className="stat-label">Cleanest right now</span>
            <strong className="stat-city">
              <span aria-hidden="true">{flagEmoji(stats.cleanest.reading.location.countryCode)}</span>
              {stats.cleanest.reading.location.name}
            </strong>
            <span className="stat-value" style={{ color: getCategory(stats.cleanest.value, standard).color }}>
              {formatAqi(stats.cleanest.value, standard)}
              <small> {getCategory(stats.cleanest.value, standard).short}</small>
            </span>
          </button>

          <button
            type="button"
            className="card stat-card"
            onClick={() => onSelect(stats.dirtiest.reading.location)}
          >
            <span className="stat-label">Most polluted</span>
            <strong className="stat-city">
              <span aria-hidden="true">{flagEmoji(stats.dirtiest.reading.location.countryCode)}</span>
              {stats.dirtiest.reading.location.name}
            </strong>
            <span className="stat-value" style={{ color: getCategory(stats.dirtiest.value, standard).color }}>
              {formatAqi(stats.dirtiest.value, standard)}
              <small> {getCategory(stats.dirtiest.value, standard).short}</small>
            </span>
          </button>

          <div className="card stat-card static">
            <span className="stat-label">Cities to watch</span>
            <strong className="stat-big">
              {stats.caution}
              <small> / {stats.available}</small>
            </strong>
            <span className="stat-foot">
              at or above “{categoriesFor(standard)[2].label}”
            </span>
          </div>
        </div>
      )}

      <div className={`global-grid ${state.refreshing ? 'is-refreshing' : ''}`}>
        <section className="card panel map-panel">
          <div className="panel-head">
            <div>
              <h2>Live map</h2>
              <p>Marker size and colour follow the current AQI.</p>
            </div>
            <span className="chip subtle">{STANDARD_LABEL[standard]}</span>
          </div>
          <WorldMap readings={readings} standard={standard} onSelect={(reading) => onSelect(reading.location)} />
        </section>

        <section className="card panel ranking-panel">
          <div className="panel-head">
            <div>
              <h2>City ranking</h2>
              <p>Select a city to open its full forecast.</p>
            </div>
            <span className="chip subtle">{visible.length} shown</span>
          </div>

          <div className="global-toolbar">
            <div className="continent-chips" role="group" aria-label="Filter by continent">
              {CONTINENTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`mini-chip ${continent === item ? 'is-active' : ''}`}
                  aria-pressed={continent === item}
                  onClick={() => setContinent(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="toolbar-row">
              <label className="mini-search">
                <SearchIcon size={14} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter cities"
                  aria-label="Filter cities by name"
                />
              </label>
              <label className="select-wrap">
                <span className="sr-only">Sort cities</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
                  <option value="worst">Most polluted first</option>
                  <option value="best">Cleanest first</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </label>
            </div>
          </div>

          <ol className="city-list">
            {visible.map((item, index) => {
              const value = item.value
              const category = getCategory(value, standard)
              const width = value == null ? 0 : Math.min(100, (value / SCALE_MAX[standard]) * 100)
              return (
                <li key={item.reading.location.id}>
                  <button
                    type="button"
                    className="city-row"
                    onClick={() => onSelect(item.reading.location)}
                    title={`Open ${item.reading.location.name}`}
                  >
                    <span className="city-rank">{String(index + 1).padStart(2, '0')}</span>
                    <span className="city-flag" aria-hidden="true">
                      {flagEmoji(item.reading.location.countryCode)}
                    </span>
                    <span className="city-main">
                      <strong>{item.reading.location.name}</strong>
                      <span>{item.reading.location.country}</span>
                    </span>
                    <span className="city-bar" aria-hidden="true">
                      <span style={{ width: `${width}%`, background: category.color }} />
                    </span>
                    <span className="city-value" style={{ color: value == null ? 'var(--faint)' : category.color }}>
                      {formatAqi(value, standard)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {visible.length === 0 && (
            <p className="empty-note">No cities match that filter. Try a different continent or search.</p>
          )}
        </section>
      </div>
    </div>
  )
}
