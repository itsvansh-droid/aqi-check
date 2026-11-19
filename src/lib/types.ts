export type Standard = 'in' | 'us' | 'eu'

export type View = 'now' | 'global'

export type Continent =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania'

/** A place the user can look up. Coordinates are always present. */
export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  admin1?: string
  country?: string
  countryCode?: string
  timezone?: string
  population?: number
}

export interface GeocodeResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
  timezone?: string
  population?: number
  feature_code?: string
}

export interface AqiCategory {
  key: string
  label: string
  short: string
  min: number
  /** Exclusive upper bound; `null` means open-ended. */
  max: number | null
  color: string
  /** A translucent version used for glows and backgrounds. */
  tint: string
  general: string
  sensitive: string
}

export interface PollutantMeta {
  key: PollutantKey
  symbol: string
  name: string
  /** WHO 2021 guideline, 24h (or stated) mean in µg/m³. */
  guideline: number
  guidelinePeriod: string
  description: string
}

export type PollutantKey =
  | 'pm2_5'
  | 'pm10'
  | 'ozone'
  | 'nitrogen_dioxide'
  | 'sulphur_dioxide'
  | 'carbon_monoxide'

export interface AirCurrent {
  time: string
  interval?: number
  us_aqi?: number | null
  european_aqi?: number | null
  pm2_5?: number | null
  pm10?: number | null
  ozone?: number | null
  nitrogen_dioxide?: number | null
  sulphur_dioxide?: number | null
  carbon_monoxide?: number | null
  uv_index?: number | null
}

export interface HourlySeries {
  time: string[]
  us_aqi?: Array<number | null>
  european_aqi?: Array<number | null>
  pm2_5?: Array<number | null>
  pm10?: Array<number | null>
  ozone?: Array<number | null>
  nitrogen_dioxide?: Array<number | null>
  sulphur_dioxide?: Array<number | null>
  carbon_monoxide?: Array<number | null>
}

export interface AirQualityResponse {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
  elevation?: number
  current_units: Record<string, string>
  current: AirCurrent
  hourly: HourlySeries
}

export interface WeatherCurrent {
  time: string
  temperature_2m?: number | null
  apparent_temperature?: number | null
  relative_humidity_2m?: number | null
  wind_speed_10m?: number | null
  wind_direction_10m?: number | null
  weather_code?: number | null
}

export interface WeatherResponse {
  timezone: string
  current_units: Record<string, string>
  current: WeatherCurrent
}

export interface WeatherInfo {
  temperature: number | null
  apparent: number | null
  humidity: number | null
  windSpeed: number | null
  windDirection: number | null
  code: number | null
  temperatureUnit: string
  windUnit: string
}

/** A day of aggregated hourly values, keyed by local calendar date. */
export interface DailySummary {
  date: string
  avg: number
  min: number
  max: number
  peakHour: string | null
}

export interface BestWindow {
  start: string
  end: string
  avg: number
}

export interface LocationReading {
  location: Location
  air: AirQualityResponse
  weather: WeatherInfo | null
  fetchedAt: number
}

export interface GlobalCityReading {
  location: Location
  continent: Continent
  aqi: number | null
  euAqi: number | null
  indiaAqi: number | null
  /** Pollutant driving the Indian AQI (CPCB dominant pollutant). */
  dominant: PollutantKey | null
  pm25: number | null
  time: string
  error?: string
}

export interface GlobalSnapshot {
  readings: GlobalCityReading[]
  fetchedAt: number
}

export type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; error: string }
