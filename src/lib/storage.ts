import type { Location, Standard } from './types'

const KEYS = {
  favorites: 'aero.favorites.v1',
  recent: 'aero.recent.v1',
  settings: 'aero.settings.v1',
  last: 'aero.last.v1',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private mode or when the quota is full.
  }
}

function isLocation(value: unknown): value is Location {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Location
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    Number.isFinite(candidate.latitude) &&
    Number.isFinite(candidate.longitude)
  )
}

export function locationId(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`
}

export function loadFavorites(): Location[] {
  const stored = read<unknown>(KEYS.favorites, [])
  return Array.isArray(stored) ? stored.filter(isLocation).slice(0, 20) : []
}

export function saveFavorites(favorites: Location[]): void {
  write(KEYS.favorites, favorites.slice(0, 20))
}

export function loadRecent(): Location[] {
  const stored = read<unknown>(KEYS.recent, [])
  return Array.isArray(stored) ? stored.filter(isLocation).slice(0, 6) : []
}

export function saveRecent(recent: Location[]): void {
  write(KEYS.recent, recent.slice(0, 6))
}

export interface Settings {
  standard: Standard
}

export function loadSettings(): Settings {
  const stored = read<Partial<Settings>>(KEYS.settings, {})
  if (stored.standard === 'us' || stored.standard === 'eu') {
    return { standard: stored.standard }
  }
  // Indian AQI (CPCB) is the default standard.
  return { standard: 'in' }
}

export function saveSettings(settings: Settings): void {
  write(KEYS.settings, settings)
}

export function loadLastLocation(): Location | null {
  const stored = read<unknown>(KEYS.last, null)
  return isLocation(stored) ? stored : null
}

export function saveLastLocation(location: Location): void {
  write(KEYS.last, location)
}
