import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { aqiValueFor, getCategory, flagEmoji, STANDARD_LABEL } from './lib/aqi'
import { clearApiCache } from './lib/http'
import { reverseGeocode } from './lib/openMeteo'
import { GeolocationError, requestPosition } from './lib/geo'
import { guessHomeLocation } from './lib/cities'
import {
  loadFavorites,
  loadLastLocation,
  loadRecent,
  loadSettings,
  saveFavorites,
  saveLastLocation,
  saveRecent,
  saveSettings,
} from './lib/storage'
import { useAirQuality } from './hooks/useAirQuality'
import { useGlobalAqi } from './hooks/useGlobalAqi'
import type { Location, Standard, View } from './lib/types'
import { Sidebar } from './components/Sidebar'
import { SearchBox } from './components/SearchBox'
import { NowView } from './components/NowView'
import { GlobalView } from './components/GlobalView'
import {
  GlobeIcon,
  InfoIcon,
  LeafIcon,
  LocateIcon,
  LogoMark,
  RefreshIcon,
} from './components/Icons'

function readUrlLocation(): Location | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const latitude = Number(params.get('lat'))
    const longitude = Number(params.get('lon'))
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
    if (params.get('lat') === null || params.get('lon') === null) return null
    return {
      id: `${latitude.toFixed(3)},${longitude.toFixed(3)}`,
      name: params.get('name')?.trim() || 'Selected place',
      latitude,
      longitude,
      admin1: params.get('region') || undefined,
      country: params.get('country') || undefined,
      countryCode: params.get('cc') || undefined,
    }
  } catch {
    return null
  }
}

function initialLocation(): Location {
  return readUrlLocation() ?? loadLastLocation() ?? guessHomeLocation()
}

function initialView(): View {
  try {
    return new URLSearchParams(window.location.search).get('view') === 'global' ? 'global' : 'now'
  } catch {
    return 'now'
  }
}

export default function App() {
  const [standard, setStandard] = useState<Standard>(() => loadSettings().standard)
  const [favorites, setFavorites] = useState<Location[]>(() => loadFavorites())
  const [recent, setRecent] = useState<Location[]>(() => loadRecent())
  const [location, setLocation] = useState<Location>(initialLocation)
  const [view, setView] = useState<View>(initialView)
  const [locating, setLocating] = useState(false)
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const air = useAirQuality(location)
  const global = useGlobalAqi(view === 'global')

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4500)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => saveFavorites(favorites), [favorites])
  useEffect(() => saveRecent(recent), [recent])
  useEffect(() => saveSettings({ standard }), [standard])
  useEffect(() => saveLastLocation(location), [location])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('lat', location.latitude.toFixed(4))
    params.set('lon', location.longitude.toFixed(4))
    params.set('name', location.name)
    if (location.admin1) params.set('region', location.admin1)
    if (location.country) params.set('country', location.country)
    if (location.countryCode) params.set('cc', location.countryCode)
    if (view === 'global') params.set('view', 'global')
    try {
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    } catch {
      // History can be unavailable in sandboxed contexts.
    }
  }, [location, view])

  useEffect(() => {
    document.title =
      view === 'global' ? 'Global air quality · Aero' : `${location.name} air quality · Aero`
  }, [location.name, view])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (event.key === '/' && !typing) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const selectLocation = useCallback((next: Location) => {
    setLocation(next)
    setView('now')
    setRecent((previous) => [next, ...previous.filter((item) => item.id !== next.id)].slice(0, 6))
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // jsdom and some embedded browsers do not implement smooth scrolling.
    }
  }, [])

  const useMyLocation = async () => {
    if (locating) return
    setLocating(true)
    try {
      const position = await requestPosition()
      const place = await reverseGeocode(position.latitude, position.longitude)
      selectLocation(place)
      showToast(`Showing air quality for ${place.name}`)
    } catch (error) {
      const message =
        error instanceof GeolocationError || error instanceof Error
          ? error.message
          : 'Your location could not be determined.'
      showToast(message)
    } finally {
      setLocating(false)
    }
  }

  const isFavorite = favorites.some((item) => item.id === location.id)

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites((previous) => previous.filter((item) => item.id !== location.id))
      showToast(`${location.name} removed from saved places`)
    } else {
      setFavorites((previous) => [location, ...previous].slice(0, 20))
      showToast(`${location.name} saved to your places`)
    }
  }

  const removeFavorite = (id: string) => {
    const removed = favorites.find((item) => item.id === id)
    setFavorites((previous) => previous.filter((item) => item.id !== id))
    if (removed) showToast(`${removed.name} removed from saved places`)
  }

  const refreshAll = () => {
    clearApiCache()
    if (view === 'global') global.refresh()
    else air.refresh()
  }

  const aqiValue = air.data ? aqiValueFor(air.data.air, standard) : null
  const category = getCategory(aqiValue, standard)
  const accent = view === 'now' ? category.color : '#38bdf8'
  const accentTint = view === 'now' ? category.tint : 'rgba(56, 189, 248, 0.14)'
  const busy =
    view === 'now'
      ? air.status === 'loading' || air.refreshing
      : global.status === 'loading' || global.refreshing

  return (
    <div
      className="app"
      style={{ '--accent': accent, '--accent-tint': accentTint } as CSSProperties}
    >
      <div className="ambient" aria-hidden="true">
        <span className="ambient-a" />
        <span className="ambient-b" />
        <span className="ambient-grid" />
      </div>

      <Sidebar
        favorites={favorites}
        recent={recent}
        activeId={location.id}
        locating={locating}
        onSelect={selectLocation}
        onRemoveFavorite={removeFavorite}
        onUseLocation={useMyLocation}
        onSearchFocus={() => searchRef.current?.focus()}
      />

      <div className="shell">
        <header className="topbar">
          <div className="mobile-brand">
            <LogoMark size={32} />
            <span>aero</span>
          </div>

          <SearchBox
            onSelect={selectLocation}
            onUseLocation={useMyLocation}
            locating={locating}
            recent={recent}
            inputRef={searchRef}
          />

          <div className="topbar-actions">
            <div
              className="segmented"
              role="group"
              aria-label="Air quality index standard"
              title="Switch between the Indian CPCB, US EPA and European AQI scales"
            >
              <button
                type="button"
                className={standard === 'in' ? 'is-active' : ''}
                aria-pressed={standard === 'in'}
                onClick={() => setStandard('in')}
              >
                IN
              </button>
              <button
                type="button"
                className={standard === 'us' ? 'is-active' : ''}
                aria-pressed={standard === 'us'}
                onClick={() => setStandard('us')}
              >
                US
              </button>
              <button
                type="button"
                className={standard === 'eu' ? 'is-active' : ''}
                aria-pressed={standard === 'eu'}
                onClick={() => setStandard('eu')}
              >
                EU
              </button>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={useMyLocation}
              disabled={locating}
              title="Use my current location"
              aria-label="Use my current location"
            >
              {locating ? <span className="spinner small" /> : <LocateIcon size={18} />}
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={refreshAll}
              disabled={busy}
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshIcon size={18} className={busy ? 'spin' : ''} />
            </button>
          </div>
        </header>

        {favorites.length > 0 && (
          <div className="mobile-places" aria-label="Saved places">
            {favorites.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`quick-place ${item.id === location.id ? 'is-active' : ''}`}
                onClick={() => selectLocation(item)}
              >
                <span aria-hidden="true">{flagEmoji(item.countryCode)}</span>
                {item.name}
              </button>
            ))}
          </div>
        )}

        <main className="main">
          <div className="main-head">
            <div className="view-tabs" role="group" aria-label="Views">
              <button
                type="button"
                className={view === 'now' ? 'is-active' : ''}
                aria-pressed={view === 'now'}
                onClick={() => setView('now')}
              >
                <LeafIcon size={15} /> Air now
              </button>
              <button
                type="button"
                className={view === 'global' ? 'is-active' : ''}
                aria-pressed={view === 'global'}
                onClick={() => setView('global')}
              >
                <GlobeIcon size={15} /> Global map
              </button>
            </div>
            <span className="main-note">{STANDARD_LABEL[standard]} · live worldwide</span>
          </div>

          {view === 'now' ? (
            <NowView
              location={location}
              state={air}
              standard={standard}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <GlobalView
              state={global}
              standard={standard}
              onSelect={selectLocation}
              onRefresh={refreshAll}
            />
          )}
        </main>

        <footer className="footer">
          <span>
            Aero · live air quality from{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{' '}
            · <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">API</a>
          </span>
          <span>Model estimates for awareness, not medical advice.</span>
        </footer>
      </div>

      {toast && (
        <div className="toast" role="status" key={toast.id}>
          <InfoIcon size={16} />
          {toast.message}
        </div>
      )}
    </div>
  )
}
