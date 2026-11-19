import type {
  AirQualityResponse,
  GeocodeResult,
  Location,
  WeatherInfo,
  WeatherResponse,
} from './types'
import { fetchJson } from './http'

export const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
export const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
export const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

const CURRENT_FIELDS = [
  'us_aqi',
  'european_aqi',
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
  'uv_index',
] as const

const HOURLY_FIELDS = [
  'us_aqi',
  'european_aqi',
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
] as const

/** Current fields needed to estimate the Indian AQI for map cities. */
const BATCH_CURRENT_FIELDS = [
  'us_aqi',
  'european_aqi',
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
] as const

const AIR_TTL = 10 * 60 * 1000
const GEO_TTL = 24 * 60 * 60 * 1000
const BATCH_SIZE = 15

const roundCoord = (value: number) => Math.round(value * 1000) / 1000

export function buildAirQualityUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    forecast_days: '5',
    // One day of history so CPCB 24h and 8h rolling averages are available.
    past_days: '1',
    timezone: 'auto',
  })
  return `${AIR_QUALITY_URL}?${params.toString()}`
}

export function buildBatchAirQualityUrl(points: Array<{ latitude: number; longitude: number }>): string {
  const params = new URLSearchParams({
    latitude: points.map((p) => p.latitude.toFixed(3)).join(','),
    longitude: points.map((p) => p.longitude.toFixed(3)).join(','),
    current: BATCH_CURRENT_FIELDS.join(','),
    timezone: 'auto',
  })
  return `${AIR_QUALITY_URL}?${params.toString()}`
}

export function buildGeocodeUrl(query: string): string {
  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'en',
    format: 'json',
  })
  return `${GEOCODING_URL}?${params.toString()}`
}

export function buildWeatherUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code',
    timezone: 'auto',
  })
  return `${WEATHER_URL}?${params.toString()}`
}

export function buildReverseGeocodeUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'en',
  })
  return `${REVERSE_GEOCODE_URL}?${params.toString()}`
}

function assertAirQuality(data: unknown): AirQualityResponse {
  const response = data as AirQualityResponse
  if (!response || typeof response !== 'object' || !response.current) {
    throw new Error('The air quality service returned an unexpected response.')
  }
  return response
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<AirQualityResponse> {
  const data = await fetchJson<AirQualityResponse>(buildAirQualityUrl(latitude, longitude), {
    signal,
    ttlMs: AIR_TTL,
  })
  return assertAirQuality(data)
}

export interface BatchPoint {
  id: string
  latitude: number
  longitude: number
}

/**
 * Fetch current conditions for many places in as few requests as possible.
 * Failures are isolated per chunk so one bad coordinate cannot blank the map.
 */
export async function fetchBatchAirQuality(
  points: BatchPoint[],
  signal?: AbortSignal,
): Promise<Map<string, AirQualityResponse>> {
  const results = new Map<string, AirQualityResponse>()
  const chunks: BatchPoint[][] = []
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    chunks.push(points.slice(i, i + BATCH_SIZE))
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const data = await fetchJson<AirQualityResponse[]>(buildBatchAirQualityUrl(chunk), {
          signal,
          ttlMs: AIR_TTL / 2,
        })
        if (!Array.isArray(data)) return
        chunk.forEach((point, index) => {
          const reading = data[index]
          if (reading?.current) results.set(point.id, reading)
        })
      } catch {
        // The chunk is skipped; those cities surface as unavailable.
      }
    }),
  )

  return results
}

export function normalizeGeocodeResult(result: GeocodeResult): Location {
  const latitude = roundCoord(result.latitude)
  const longitude = roundCoord(result.longitude)
  return {
    id: `${latitude},${longitude}`,
    name: result.name,
    latitude,
    longitude,
    admin1: result.admin1,
    country: result.country,
    countryCode: result.country_code,
    timezone: result.timezone,
    population: result.population,
  }
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<Location[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []
  const data = await fetchJson<{ results?: GeocodeResult[] }>(buildGeocodeUrl(trimmed), {
    signal,
    ttlMs: GEO_TTL,
    timeoutMs: 10_000,
  })
  return (data.results ?? []).map(normalizeGeocodeResult)
}

interface ReverseGeocodeResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
  countryCode?: string
}

/**
 * Coordinates have no names, so we resolve a friendly label. This is a
 * best-effort call: if it fails we still have a perfectly usable location.
 */
export async function reverseGeocode(latitude: number, longitude: number, signal?: AbortSignal): Promise<Location> {
  const fallback: Location = {
    id: `${roundCoord(latitude)},${roundCoord(longitude)}`,
    name: 'My location',
    latitude: roundCoord(latitude),
    longitude: roundCoord(longitude),
  }

  try {
    const data = await fetchJson<ReverseGeocodeResponse>(buildReverseGeocodeUrl(latitude, longitude), {
      signal,
      ttlMs: GEO_TTL,
      timeoutMs: 7000,
      retries: 0,
    })
    const name = data.city || data.locality || 'My location'
    return {
      ...fallback,
      name,
      admin1: data.principalSubdivision || undefined,
      country: data.countryName || undefined,
      countryCode: data.countryCode || undefined,
    }
  } catch {
    return fallback
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<WeatherInfo> {
  const data = await fetchJson<WeatherResponse>(buildWeatherUrl(latitude, longitude), {
    signal,
    ttlMs: AIR_TTL,
    timeoutMs: 9000,
    retries: 1,
  })
  const units = data.current_units ?? {}
  const current = data.current ?? {}
  return {
    temperature: current.temperature_2m ?? null,
    apparent: current.apparent_temperature ?? null,
    humidity: current.relative_humidity_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    windDirection: current.wind_direction_10m ?? null,
    code: current.weather_code ?? null,
    temperatureUnit: units.temperature_2m ?? '°C',
    windUnit: units.wind_speed_10m ?? 'km/h',
  }
}
