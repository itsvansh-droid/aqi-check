import type {
  AirQualityResponse,
  AqiCategory,
  BestWindow,
  DailySummary,
  HourlySeries,
  PollutantKey,
  PollutantMeta,
  Standard,
} from './types'

export const STANDARD_LABEL: Record<Standard, string> = {
  in: 'Indian AQI',
  us: 'US AQI',
  eu: 'European AQI',
}

export const STANDARD_SHORT: Record<Standard, string> = {
  in: 'IN',
  us: 'US',
  eu: 'EU',
}

/** Maximum value rendered by the gauge. Values above are clamped. */
export const SCALE_MAX: Record<Standard, number> = { in: 500, us: 300, eu: 100 }

/** Category breakpoints used to draw ticks on the gauge. */
export const BREAKPOINTS: Record<Standard, number[]> = {
  in: [0, 50, 100, 200, 300, 400],
  us: [0, 50, 100, 150, 200, 300],
  eu: [0, 20, 40, 60, 80, 100],
}

const US_CATEGORIES: AqiCategory[] = [
  {
    key: 'good',
    label: 'Good',
    short: 'Good',
    min: 0,
    max: 50,
    color: '#34d399',
    tint: 'rgba(52, 211, 153, 0.16)',
    general: 'Air quality is satisfactory and poses little or no risk.',
    sensitive: 'Enjoy your usual outdoor activities.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    short: 'Moderate',
    min: 51,
    max: 100,
    color: '#fbbf24',
    tint: 'rgba(251, 191, 36, 0.16)',
    general: 'Air quality is acceptable for most people.',
    sensitive: 'Unusually sensitive people should consider reducing prolonged or heavy exertion outdoors.',
  },
  {
    key: 'sensitive',
    label: 'Unhealthy for sensitive groups',
    short: 'Sensitive groups',
    min: 101,
    max: 150,
    color: '#fb923c',
    tint: 'rgba(251, 146, 60, 0.16)',
    general: 'Some pollutants may affect people who are unusually sensitive to air pollution.',
    sensitive:
      'Children, older adults, and people with heart or lung conditions should limit prolonged outdoor exertion.',
  },
  {
    key: 'unhealthy',
    label: 'Unhealthy',
    short: 'Unhealthy',
    min: 151,
    max: 200,
    color: '#f87171',
    tint: 'rgba(248, 113, 113, 0.16)',
    general: 'Everyone may begin to experience health effects.',
    sensitive: 'Sensitive groups should avoid prolonged or heavy outdoor exertion.',
  },
  {
    key: 'very-unhealthy',
    label: 'Very unhealthy',
    short: 'Very unhealthy',
    min: 201,
    max: 300,
    color: '#c084fc',
    tint: 'rgba(192, 132, 252, 0.18)',
    general: 'Health alert: everyone may experience more serious health effects.',
    sensitive: 'Sensitive groups should avoid all outdoor exertion and stay indoors where possible.',
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    short: 'Hazardous',
    min: 301,
    max: null,
    color: '#f43f5e',
    tint: 'rgba(244, 63, 94, 0.2)',
    general: 'Emergency conditions. Everyone is likely to be affected.',
    sensitive:
      'Everyone should avoid outdoor exertion. Keep windows closed and run an air purifier if you have one.',
  },
]

const EU_CATEGORIES: AqiCategory[] = [
  {
    key: 'good',
    label: 'Good',
    short: 'Good',
    min: 0,
    max: 20,
    color: '#34d399',
    tint: 'rgba(52, 211, 153, 0.16)',
    general: 'Air quality is good. A great day to be outside.',
    sensitive: 'No precautions needed.',
  },
  {
    key: 'fair',
    label: 'Fair',
    short: 'Fair',
    min: 21,
    max: 40,
    color: '#a3e635',
    tint: 'rgba(163, 230, 53, 0.16)',
    general: 'Air quality is fair and unlikely to affect most people.',
    sensitive: 'Very sensitive individuals may notice mild irritation.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    short: 'Moderate',
    min: 41,
    max: 60,
    color: '#fbbf24',
    tint: 'rgba(251, 191, 36, 0.16)',
    general: 'Air quality is moderate. Most people are not affected.',
    sensitive: 'Sensitive people should reduce prolonged or intense outdoor activity.',
  },
  {
    key: 'poor',
    label: 'Poor',
    short: 'Poor',
    min: 61,
    max: 80,
    color: '#fb923c',
    tint: 'rgba(251, 146, 60, 0.16)',
    general: 'Some health effects may appear in sensitive groups.',
    sensitive: 'Reduce outdoor exertion, especially if you have heart or lung conditions.',
  },
  {
    key: 'very-poor',
    label: 'Very poor',
    short: 'Very poor',
    min: 81,
    max: 100,
    color: '#f87171',
    tint: 'rgba(248, 113, 113, 0.16)',
    general: 'Everyone may experience health effects.',
    sensitive: 'Avoid outdoor exertion and keep windows closed.',
  },
  {
    key: 'extremely-poor',
    label: 'Extremely poor',
    short: 'Extremely poor',
    min: 101,
    max: null,
    color: '#c084fc',
    tint: 'rgba(192, 132, 252, 0.18)',
    general: 'Serious health risk for the whole population.',
    sensitive: 'Stay indoors, seal windows, and use filtered air where possible.',
  },
]

/**
 * CPCB / National Air Quality Index bands. Indian AQI runs to 500, so the
 * categories use a different scale from the US and European indices.
 */
const IN_CATEGORIES: AqiCategory[] = [
  {
    key: 'good',
    label: 'Good',
    short: 'Good',
    min: 0,
    max: 50,
    color: '#34d399',
    tint: 'rgba(52, 211, 153, 0.16)',
    general: 'Air quality is good and poses little or no risk.',
    sensitive: 'Enjoy your usual outdoor activities.',
  },
  {
    key: 'satisfactory',
    label: 'Satisfactory',
    short: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#a3e635',
    tint: 'rgba(163, 230, 53, 0.16)',
    general: 'Air quality is satisfactory, with minor discomfort possible for sensitive people.',
    sensitive: 'Very sensitive people may notice mild irritation; reduce heavy exertion if needed.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    short: 'Moderate',
    min: 101,
    max: 200,
    color: '#fbbf24',
    tint: 'rgba(251, 191, 36, 0.16)',
    general: 'Air quality is moderate. Sensitive people may experience breathing discomfort.',
    sensitive:
      'People with asthma, heart or lung conditions, children, and older adults should limit prolonged outdoor exertion.',
  },
  {
    key: 'poor',
    label: 'Poor',
    short: 'Poor',
    min: 201,
    max: 300,
    color: '#fb923c',
    tint: 'rgba(251, 146, 60, 0.16)',
    general: 'Air quality is poor and may cause breathing discomfort on prolonged exposure.',
    sensitive:
      'Sensitive groups should avoid prolonged outdoor exertion; everyone should reduce heavy activity outdoors.',
  },
  {
    key: 'very-poor',
    label: 'Very poor',
    short: 'Very poor',
    min: 301,
    max: 400,
    color: '#f87171',
    tint: 'rgba(248, 113, 113, 0.16)',
    general: 'Air quality is very poor and can cause respiratory illness on prolonged exposure.',
    sensitive:
      'Avoid outdoor exertion. Keep windows closed and use filtered or purifier air where possible.',
  },
  {
    key: 'severe',
    label: 'Severe',
    short: 'Severe',
    min: 401,
    max: null,
    color: '#e11d48',
    tint: 'rgba(225, 29, 72, 0.2)',
    general: 'Air quality is severe and affects healthy people, with serious risk on exposure.',
    sensitive:
      'Everyone should avoid outdoor exertion and stay indoors. Seek medical advice if you feel unwell.',
  },
]

const CATEGORIES: Record<Standard, AqiCategory[]> = {
  in: IN_CATEGORIES,
  us: US_CATEGORIES,
  eu: EU_CATEGORIES,
}

export function categoriesFor(standard: Standard): AqiCategory[] {
  return CATEGORIES[standard]
}

export function getCategory(value: number | null | undefined, standard: Standard): AqiCategory {
  const categories = CATEGORIES[standard]
  if (value == null || Number.isNaN(value)) return categories[0]
  // Round before lookup so fractional AQI values (e.g. 50.5) never fall into
  // the gap between two integer category bands.
  const v = Math.max(0, Math.round(value))
  return (
    categories.find((c) => v >= c.min && (c.max == null || v <= c.max)) ??
    categories[categories.length - 1]
  )
}

export function getCategoryIndex(value: number | null | undefined, standard: Standard): number {
  const category = getCategory(value, standard)
  return CATEGORIES[standard].findIndex((c) => c.key === category.key)
}

export const POLLUTANTS: PollutantMeta[] = [
  {
    key: 'pm2_5',
    symbol: 'PM₂.₅',
    name: 'Fine particles',
    guideline: 15,
    guidelinePeriod: '24h',
    description: 'Microscopic particles that can penetrate deep into the lungs and bloodstream.',
  },
  {
    key: 'pm10',
    symbol: 'PM₁₀',
    name: 'Coarse particles',
    guideline: 45,
    guidelinePeriod: '24h',
    description: 'Dust, pollen and other particles small enough to reach the airways.',
  },
  {
    key: 'ozone',
    symbol: 'O₃',
    name: 'Ozone',
    guideline: 100,
    guidelinePeriod: '8h',
    description: 'Formed when sunlight reacts with traffic and industrial emissions.',
  },
  {
    key: 'nitrogen_dioxide',
    symbol: 'NO₂',
    name: 'Nitrogen dioxide',
    guideline: 25,
    guidelinePeriod: '24h',
    description: 'Mainly from vehicles and combustion; irritates the respiratory tract.',
  },
  {
    key: 'sulphur_dioxide',
    symbol: 'SO₂',
    name: 'Sulphur dioxide',
    guideline: 40,
    guidelinePeriod: '24h',
    description: 'Released by burning fossil fuels; can constrict the airways.',
  },
  {
    key: 'carbon_monoxide',
    symbol: 'CO',
    name: 'Carbon monoxide',
    guideline: 4000,
    guidelinePeriod: '24h',
    description: 'Colorless gas from incomplete combustion that reduces oxygen in the blood.',
  },
]

export const POLLUTANT_UNITS: Record<PollutantKey, string> = {
  pm2_5: 'µg/m³',
  pm10: 'µg/m³',
  ozone: 'µg/m³',
  nitrogen_dioxide: 'µg/m³',
  sulphur_dioxide: 'µg/m³',
  carbon_monoxide: 'µg/m³',
}

export function pollutantValue(
  current: Partial<Record<PollutantKey | 'uv_index', number | null>>,
  key: PollutantKey,
): number | null {
  const value = current[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function pollutantMeta(key: PollutantKey | null | undefined): PollutantMeta | null {
  if (!key) return null
  return POLLUTANTS.find((pollutant) => pollutant.key === key) ?? null
}

/** One band of the official CPCB breakpoint table. */
export interface CpcbBreakpoint {
  cLow: number
  cHigh: number
  iLow: number
  iHigh: number
}

/**
 * CPCB (National AQI) concentration breakpoints.
 *
 * All pollutants are µg/m³ except CO, which the CPCB table defines in mg/m³.
 * The Open-Meteo API reports CO in µg/m³, so it is converted in `cpcbSubIndex`.
 * The final band of each table is extended to a finite upper bound so values
 * above the published range can still be interpolated up to a sub-index of 500.
 */
export const CPCB_BREAKPOINTS: Record<PollutantKey, CpcbBreakpoint[]> = {
  pm2_5: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  ozone: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
  nitrogen_dioxide: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 600, iLow: 401, iHigh: 500 },
  ],
  sulphur_dioxide: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 },
  ],
  carbon_monoxide: [
    { cLow: 0, cHigh: 1, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50, iLow: 401, iHigh: 500 },
  ],
}

/**
 * CPCB averaging window for each pollutant, in hours. The National AQI
 * protocol uses 24h windows for particulates, NO₂, and SO₂, and 8h windows
 * for the two gases with strong diurnal cycles, O₃ and CO.
 */
export const CPCB_AVERAGING_HOURS: Record<PollutantKey, number> = {
  pm2_5: 24,
  pm10: 24,
  ozone: 8,
  nitrogen_dioxide: 24,
  sulphur_dioxide: 24,
  carbon_monoxide: 8,
}

/**
 * Convert a pollutant concentration into its CPCB sub-index using the official
 * linear-interpolation formula. `null` means the pollutant was unavailable.
 */
export function cpcbSubIndex(concentration: number | null, key: PollutantKey): number | null {
  if (concentration == null || !Number.isFinite(concentration)) return null
  // The CPCB CO table is in mg/m³ while the API reports µg/m³.
  const value = key === 'carbon_monoxide' ? concentration / 1000 : concentration
  if (value <= 0) return 0

  const table = CPCB_BREAKPOINTS[key]
  const band = table.find((row) => value <= row.cHigh) ?? table[table.length - 1]
  const span = band.cHigh - band.cLow
  const ratio = span <= 0 ? 1 : Math.min(1, Math.max(0, (value - band.cLow) / span))
  return Math.round(band.iLow + ratio * (band.iHigh - band.iLow))
}

/**
 * Mean of the `hours` values ending at `endIndex`. CPCB averages need at
 * least 75% of the expected hours (18 of 24, 6 of 8); shorter windows are
 * treated as unavailable rather than reported as a misleading average.
 */
export function rollingAverage(
  values: Array<number | null> | undefined,
  endIndex: number,
  hours: number,
): number | null {
  if (!values || values.length === 0) return null
  const end = Math.min(endIndex, values.length - 1)
  if (end < 0) return null
  const start = Math.max(0, end - hours + 1)

  let sum = 0
  let count = 0
  for (let index = start; index <= end; index += 1) {
    const value = values[index]
    if (value == null || !Number.isFinite(value)) continue
    sum += value
    count += 1
  }

  const required = Math.max(1, Math.ceil(hours * 0.75))
  if (count < required) return null
  return sum / count
}

export interface IndiaAqiResult {
  /** Maximum CPCB sub-index, i.e. the Indian AQI. */
  value: number | null
  /** Pollutant with the highest sub-index. */
  dominant: PollutantKey | null
  subIndices: Partial<Record<PollutantKey, number | null>>
}

function combineSubIndices(
  subIndices: Partial<Record<PollutantKey, number | null>>,
): IndiaAqiResult {
  let value: number | null = null
  let dominant: PollutantKey | null = null

  for (const pollutant of POLLUTANTS) {
    const subIndex = subIndices[pollutant.key] ?? null
    if (subIndex == null) continue
    if (value == null || subIndex > value) {
      value = subIndex
      dominant = pollutant.key
    }
  }

  return { value, dominant, subIndices }
}

/** Indian AQI for a single hourly index, using CPCB rolling averages. */
export function computeIndiaAqiAt(hourly: HourlySeries, index: number): IndiaAqiResult {
  const subIndices: Partial<Record<PollutantKey, number | null>> = {}
  for (const pollutant of POLLUTANTS) {
    const average = rollingAverage(hourly[pollutant.key], index, CPCB_AVERAGING_HOURS[pollutant.key])
    subIndices[pollutant.key] = cpcbSubIndex(average, pollutant.key)
  }
  return combineSubIndices(subIndices)
}

/** Indian AQI for the hour matching `currentTime`, falling back to the latest hour. */
export function indiaAqiForHourly(hourly: HourlySeries, currentTime: string): IndiaAqiResult {
  const times = hourly?.time ?? []
  if (times.length === 0) return { value: null, dominant: null, subIndices: {} }

  const target = (currentTime || '').slice(0, 13)
  let index = times.findIndex((time) => time.slice(0, 13) === target)
  if (index < 0) {
    for (let cursor = times.length - 1; cursor >= 0; cursor -= 1) {
      if (times[cursor].slice(0, 13) <= target) {
        index = cursor
        break
      }
    }
  }
  if (index < 0) index = times.length - 1
  return computeIndiaAqiAt(hourly, index)
}

/** Indian AQI for every hour in the series, used for charts and daily summaries. */
export function buildIndiaSeries(hourly: HourlySeries): Array<number | null> | undefined {
  if (!hourly?.time || hourly.time.length === 0) return undefined
  return hourly.time.map((_, index) => computeIndiaAqiAt(hourly, index).value)
}

/**
 * Indian AQI from a single set of current concentrations. Used by the global
 * map, where fetching 24h histories for every city would be impractical.
 * Values are therefore instantaneous rather than rolling averages.
 */
export function indiaAqiFromCurrent(
  current: Partial<Record<PollutantKey, number | null>>,
): IndiaAqiResult {
  const subIndices: Partial<Record<PollutantKey, number | null>> = {}
  for (const pollutant of POLLUTANTS) {
    subIndices[pollutant.key] = cpcbSubIndex(pollutantValue(current, pollutant.key), pollutant.key)
  }
  return combineSubIndices(subIndices)
}

/** Resolve the AQI value for a reading under the selected standard. */
export function aqiValueFor(air: AirQualityResponse, standard: Standard): number | null {
  if (standard === 'in') return indiaAqiForHourly(air.hourly, air.current.time).value
  return standard === 'us' ? air.current.us_aqi ?? null : air.current.european_aqi ?? null
}

/** Ratio of a measured concentration to the WHO guideline. */
export function whoRatio(value: number | null, guideline: number): number | null {
  if (value == null || !Number.isFinite(guideline) || guideline <= 0) return null
  return value / guideline
}

export function gaugeFraction(value: number | null, standard: Standard): number {
  if (value == null || Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value / SCALE_MAX[standard]))
}

const round = (n: number) => Math.round(n)

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function seriesFor(
  hourly: HourlySeries,
  standard: Standard,
): Array<number | null> | undefined {
  if (standard === 'in') return buildIndiaSeries(hourly)
  return standard === 'us' ? hourly.us_aqi : hourly.european_aqi
}

/**
 * Group hourly values into calendar-day summaries. Values are keyed by their
 * local date and time exactly as provided by the API, so no timezone maths
 * (and no DST bugs) are needed.
 */
export function buildDailySummaries(
  times: string[],
  values: Array<number | null> | undefined,
  limit = 5,
  fromDate?: string,
): DailySummary[] {
  if (!values) return []
  const byDate = new Map<string, { values: number[]; peakHour: string | null; peak: number }>()

  times.forEach((time, index) => {
    const value = values[index]
    if (value == null || !Number.isFinite(value)) return
    const date = time.slice(0, 10)
    // The API includes yesterday for rolling averages; the outlook starts today.
    if (fromDate && date < fromDate) return
    const bucket = byDate.get(date) ?? { values: [], peakHour: null, peak: -Infinity }
    bucket.values.push(value)
    if (value > bucket.peak) {
      bucket.peak = value
      bucket.peakHour = time
    }
    byDate.set(date, bucket)
  })

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .slice(0, limit)
    .map(([date, bucket]) => ({
      date,
      avg: round(average(bucket.values)),
      min: round(Math.min(...bucket.values)),
      max: round(Math.max(...bucket.values)),
      peakHour: bucket.peakHour,
    }))
}

export interface TrendPoint {
  time: string
  value: number
}

/**
 * Slice the next `hours` hourly values starting at the current hour. If the
 * current hour is missing, the next available hour is used.
 */
export function buildTrend(
  times: string[],
  values: Array<number | null> | undefined,
  currentTime: string,
  hours = 24,
): TrendPoint[] {
  if (!values || times.length === 0) return []
  let start = times.findIndex((t) => t.slice(0, 13) === currentTime.slice(0, 13))
  if (start < 0) start = times.findIndex((t) => t >= currentTime.slice(0, 13))
  if (start < 0) start = 0

  const points: TrendPoint[] = []
  for (let i = start; i < times.length && points.length < hours; i += 1) {
    const value = values[i]
    if (value == null || !Number.isFinite(value)) continue
    points.push({ time: times[i], value })
  }
  return points
}

/**
 * Find the calmest continuous window of `windowHours` within the provided
 * hourly points. Ties resolve to the earliest window.
 */
export function findBestWindow(points: TrendPoint[], windowHours = 3): BestWindow | null {
  if (points.length === 0) return null
  const size = Math.min(windowHours, points.length)
  if (size === 0) return null

  let best: BestWindow | null = null
  let bestAvg = Infinity
  for (let i = 0; i + size <= points.length; i += 1) {
    const window = points.slice(i, i + size)
    const avg = average(window.map((p) => p.value))
    if (avg < bestAvg) {
      bestAvg = avg
      best = {
        start: window[0].time,
        end: addHoursLocal(window[window.length - 1].time, 1),
        avg: Math.round(avg),
      }
    }
  }
  return best
}

/** Add hours to a naive local ISO string without involving the browser timezone. */
export function addHoursLocal(isoLocal: string, hours: number): string {
  const [datePart, timePart = '00:00'] = isoLocal.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const stamp = Date.UTC(year, (month ?? 1) - 1, day ?? 1, (hour ?? 0) + hours, minute ?? 0)
  return new Date(stamp).toISOString().slice(0, 16)
}

export function hourLabel(isoLocal: string): string {
  return isoLocal.slice(11, 16)
}

export function formatFullLocalTime(isoLocal: string): string {
  const datePart = isoLocal.slice(0, 10)
  const timePart = isoLocal.slice(11, 16)
  const parsed = new Date(`${datePart}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return `${datePart} ${timePart}`
  const day = parsed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  return `${day} · ${timePart}`
}

export function uvLabel(value: number | null): { label: string; color: string } {
  if (value == null) return { label: 'Unknown', color: 'var(--muted)' }
  if (value < 3) return { label: 'Low', color: '#34d399' }
  if (value < 6) return { label: 'Moderate', color: '#fbbf24' }
  if (value < 8) return { label: 'High', color: '#fb923c' }
  if (value < 11) return { label: 'Very high', color: '#f87171' }
  return { label: 'Extreme', color: '#c084fc' }
}

export function windDirectionLabel(degrees: number | null): string {
  if (degrees == null) return '—'
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return directions[Math.round(((degrees % 360) / 45)) % 8]
}

const WEATHER_CODES: Array<{ codes: number[]; label: string; icon: string }> = [
  { codes: [0], label: 'Clear sky', icon: '☀️' },
  { codes: [1, 2], label: 'Mostly clear', icon: '🌤️' },
  { codes: [3], label: 'Overcast', icon: '☁️' },
  { codes: [45, 48], label: 'Fog', icon: '🌫️' },
  { codes: [51, 53, 55, 56, 57], label: 'Drizzle', icon: '🌦️' },
  { codes: [61, 63, 65, 66, 67], label: 'Rain', icon: '🌧️' },
  { codes: [71, 73, 75, 77], label: 'Snow', icon: '🌨️' },
  { codes: [80, 81, 82], label: 'Showers', icon: '🌧️' },
  { codes: [85, 86], label: 'Snow showers', icon: '🌨️' },
  { codes: [95, 96, 99], label: 'Thunderstorm', icon: '⛈️' },
]

export function weatherLabel(code: number | null): { label: string; icon: string } {
  if (code == null) return { label: 'Unknown', icon: '🌡️' }
  return WEATHER_CODES.find((entry) => entry.codes.includes(code)) ?? { label: 'Mixed', icon: '🌥️' }
}

/** Format an AQI value for display: whole numbers, `300+` above the gauge cap. */
export function formatAqi(value: number | null, standard: Standard): string {
  if (value == null) return '—'
  const rounded = Math.round(value)
  return rounded > SCALE_MAX[standard] ? `${SCALE_MAX[standard]}+` : String(rounded)
}

/** Human-friendly concentration formatting that keeps small values readable. */
export function formatConcentration(value: number | null): string {
  if (value == null) return '—'
  if (value >= 100) return String(Math.round(value))
  if (value >= 10) return value.toFixed(0)
  if (value >= 1) return value.toFixed(1)
  return value.toFixed(2)
}

export function relativeTime(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000))
  if (seconds < 45) return 'just now'
  if (seconds < 90) return '1 min ago'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`
}

export function flagEmoji(countryCode: string | undefined): string {
  if (!countryCode || !/^[a-zA-Z]{2}$/.test(countryCode)) return '🌍'
  const base = 0x1f1e6
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => base + (char.charCodeAt(0) - 65))
  return String.fromCodePoint(...codePoints)
}
