import { describe, expect, it } from 'vitest'
import {
  addHoursLocal,
  buildDailySummaries,
  buildIndiaSeries,
  buildTrend,
  computeIndiaAqiAt,
  cpcbSubIndex,
  CPCB_AVERAGING_HOURS,
  findBestWindow,
  flagEmoji,
  formatAqi,
  formatConcentration,
  gaugeFraction,
  getCategory,
  getCategoryIndex,
  hourLabel,
  indiaAqiForHourly,
  indiaAqiFromCurrent,
  relativeTime,
  rollingAverage,
  seriesFor,
  uvLabel,
  weatherLabel,
  whoRatio,
  windDirectionLabel,
} from '../lib/aqi'
import type { HourlySeries, PollutantKey } from '../lib/types'

describe('AQI categories', () => {
  it('maps US AQI breakpoints to the right category', () => {
    expect(getCategory(0, 'us').key).toBe('good')
    expect(getCategory(50, 'us').key).toBe('good')
    expect(getCategory(51, 'us').key).toBe('moderate')
    expect(getCategory(100, 'us').key).toBe('moderate')
    expect(getCategory(101, 'us').key).toBe('sensitive')
    expect(getCategory(150, 'us').key).toBe('sensitive')
    expect(getCategory(151, 'us').key).toBe('unhealthy')
    expect(getCategory(201, 'us').key).toBe('very-unhealthy')
    expect(getCategory(301, 'us').key).toBe('hazardous')
    expect(getCategory(900, 'us').key).toBe('hazardous')
  })

  it('maps European AQI breakpoints to the right category', () => {
    expect(getCategory(20, 'eu').key).toBe('good')
    expect(getCategory(21, 'eu').key).toBe('fair')
    expect(getCategory(40, 'eu').key).toBe('fair')
    expect(getCategory(41, 'eu').key).toBe('moderate')
    expect(getCategory(100, 'eu').key).toBe('very-poor')
    expect(getCategory(101, 'eu').key).toBe('extremely-poor')
  })

  it('maps Indian CPCB AQI bands to the right category', () => {
    expect(getCategory(0, 'in').key).toBe('good')
    expect(getCategory(50, 'in').key).toBe('good')
    expect(getCategory(51, 'in').key).toBe('satisfactory')
    expect(getCategory(100, 'in').key).toBe('satisfactory')
    expect(getCategory(101, 'in').key).toBe('moderate')
    expect(getCategory(200, 'in').key).toBe('moderate')
    expect(getCategory(201, 'in').key).toBe('poor')
    expect(getCategory(300, 'in').key).toBe('poor')
    expect(getCategory(301, 'in').key).toBe('very-poor')
    expect(getCategory(400, 'in').key).toBe('very-poor')
    expect(getCategory(401, 'in').key).toBe('severe')
    expect(getCategory(500, 'in').key).toBe('severe')
  })

  it('rounds fractional values so category gaps never swallow a band', () => {
    expect(getCategory(50.4, 'us').key).toBe('good')
    expect(getCategory(50.5, 'us').key).toBe('moderate')
    expect(getCategory(100.4, 'in').key).toBe('satisfactory')
    expect(getCategory(100.6, 'in').key).toBe('moderate')
  })

  it('treats missing values as good and clamps negative values', () => {
    expect(getCategory(null, 'us').key).toBe('good')
    expect(getCategory(undefined, 'eu').key).toBe('good')
    expect(getCategory(-25, 'us').key).toBe('good')
  })

  it('exposes category indexes for ranking thresholds', () => {
    expect(getCategoryIndex(25, 'us')).toBe(0)
    expect(getCategoryIndex(125, 'us')).toBe(2)
    expect(getCategoryIndex(null, 'us')).toBe(0)
  })
})

describe('gauge helpers', () => {
  it('normalises values against each standard scale', () => {
    expect(gaugeFraction(150, 'us')).toBeCloseTo(0.5)
    expect(gaugeFraction(50, 'eu')).toBeCloseTo(0.5)
    expect(gaugeFraction(250, 'in')).toBeCloseTo(0.5)
    expect(gaugeFraction(999, 'us')).toBe(1)
    expect(gaugeFraction(null, 'us')).toBe(0)
  })

  it('formats capped AQI values', () => {
    expect(formatAqi(42.4, 'us')).toBe('42')
    expect(formatAqi(305, 'us')).toBe('300+')
    expect(formatAqi(140, 'eu')).toBe('100+')
    expect(formatAqi(512, 'in')).toBe('500+')
    expect(formatAqi(null, 'us')).toBe('—')
  })

  it('formats concentrations without false precision', () => {
    expect(formatConcentration(18.432)).toBe('18')
    expect(formatConcentration(3.14159)).toBe('3.1')
    expect(formatConcentration(0.421)).toBe('0.42')
    expect(formatConcentration(null)).toBe('—')
  })
})

describe('hourly aggregation', () => {
  const times = [
    '2026-11-14T00:00',
    '2026-11-14T01:00',
    '2026-11-14T02:00',
    '2026-11-15T00:00',
    '2026-11-15T01:00',
  ]
  const values = [10, 30, 20, 80, null]

  it('builds daily averages, ranges, and peak hours', () => {
    const days = buildDailySummaries(times, values)
    expect(days).toHaveLength(2)
    expect(days[0]).toMatchObject({ date: '2026-11-14', avg: 20, min: 10, max: 30 })
    expect(days[0].peakHour).toBe('2026-11-14T01:00')
    expect(days[1]).toMatchObject({ date: '2026-11-15', avg: 80, min: 80, max: 80 })
  })

  it('respects the day limit and handles absent series', () => {
    expect(buildDailySummaries(times, values, 1)).toHaveLength(1)
    expect(buildDailySummaries(times, undefined)).toEqual([])
  })

  it('starts the outlook at the requested date', () => {
    const days = buildDailySummaries(times, values, 5, '2026-11-15')
    expect(days).toHaveLength(1)
    expect(days[0].date).toBe('2026-11-15')
  })

  it('slices 24 hours from the current hour', () => {
    const longTimes = Array.from({ length: 48 }, (_, index) => {
      const day = 14 + Math.floor(index / 24)
      const hour = String(index % 24).padStart(2, '0')
      return `2026-11-${day}T${hour}:00`
    })
    const longValues = longTimes.map((_, index) => index)
    const trend = buildTrend(longTimes, longValues, '2026-11-14T05:00', 24)
    expect(trend).toHaveLength(24)
    expect(trend[0]).toEqual({ time: '2026-11-14T05:00', value: 5 })
    expect(trend[23].value).toBe(28)
  })

  it('skips null hours in the trend', () => {
    const trend = buildTrend(times, values, '2026-11-14T00:00', 5)
    expect(trend).toHaveLength(4)
    expect(trend.map((point) => point.value)).toEqual([10, 30, 20, 80])
  })

  it('finds the calmest rolling window', () => {
    const points = [
      { time: '2026-11-14T00:00', value: 50 },
      { time: '2026-11-14T01:00', value: 40 },
      { time: '2026-11-14T02:00', value: 30 },
      { time: '2026-11-14T03:00', value: 60 },
      { time: '2026-11-14T04:00', value: 20 },
      { time: '2026-11-14T05:00', value: 70 },
    ]
    expect(findBestWindow(points, 3)).toEqual({
      start: '2026-11-14T02:00',
      end: '2026-11-14T05:00',
      avg: 37,
    })
    expect(findBestWindow([], 3)).toBeNull()
  })

  it('selects the correct series per standard', () => {
    const hourly = { time: [], us_aqi: [10], european_aqi: [4] }
    expect(seriesFor(hourly, 'us')).toEqual([10])
    expect(seriesFor(hourly, 'eu')).toEqual([4])
  })
})

describe('Indian AQI (CPCB)', () => {
  const POLLUTANT_KEYS: PollutantKey[] = [
    'pm2_5',
    'pm10',
    'ozone',
    'nitrogen_dioxide',
    'sulphur_dioxide',
    'carbon_monoxide',
  ]

  function hourlyFixture(
    concentrations: Partial<Record<PollutantKey, number>>,
    hours = 24,
  ): HourlySeries {
    const time = Array.from(
      { length: hours },
      (_, index) => `2026-11-14T${String(index).padStart(2, '0')}:00`,
    )
    const series: HourlySeries = { time }
    for (const key of POLLUTANT_KEYS) {
      const value = concentrations[key]
      if (value != null) {
        series[key] = Array.from({ length: hours }, () => value)
      }
    }
    return series
  }

  it('converts concentrations to sub-indices with linear interpolation', () => {
    expect(cpcbSubIndex(15, 'pm2_5')).toBe(25)
    expect(cpcbSubIndex(30, 'pm2_5')).toBe(50)
    expect(cpcbSubIndex(45, 'pm2_5')).toBe(75)
    expect(cpcbSubIndex(40, 'pm10')).toBe(40)
    expect(cpcbSubIndex(60, 'nitrogen_dioxide')).toBe(75)
    expect(cpcbSubIndex(60, 'sulphur_dioxide')).toBe(75)
    expect(cpcbSubIndex(120, 'ozone')).toBe(129)
    expect(cpcbSubIndex(600, 'pm2_5')).toBe(500)
    expect(cpcbSubIndex(null, 'pm2_5')).toBeNull()
  })

  it('converts carbon monoxide from µg/m³ to the mg/m³ CPCB table', () => {
    expect(cpcbSubIndex(450, 'carbon_monoxide')).toBe(23)
    expect(cpcbSubIndex(1000, 'carbon_monoxide')).toBe(50)
    expect(cpcbSubIndex(1500, 'carbon_monoxide')).toBe(73)
  })

  it('uses the official CPCB averaging windows', () => {
    expect(CPCB_AVERAGING_HOURS.pm2_5).toBe(24)
    expect(CPCB_AVERAGING_HOURS.pm10).toBe(24)
    expect(CPCB_AVERAGING_HOURS.nitrogen_dioxide).toBe(24)
    expect(CPCB_AVERAGING_HOURS.sulphur_dioxide).toBe(24)
    expect(CPCB_AVERAGING_HOURS.ozone).toBe(8)
    expect(CPCB_AVERAGING_HOURS.carbon_monoxide).toBe(8)
  })

  it('computes rolling averages and rejects windows that are too short', () => {
    expect(rollingAverage([10, 20, 30, 40], 3, 2)).toBe(35)
    expect(rollingAverage([10, 20, null, 40], 3, 4)).toBeCloseTo(70 / 3)
    expect(rollingAverage([10, null, 30], 2, 3)).toBeNull()
    expect(rollingAverage([10], 0, 24)).toBeNull()
    expect(rollingAverage(undefined, 0, 24)).toBeNull()
  })

  it('takes the maximum sub-index as the AQI and names the dominant pollutant', () => {
    const balanced = hourlyFixture({
      pm2_5: 30,
      pm10: 50,
      ozone: 50,
      nitrogen_dioxide: 40,
      sulphur_dioxide: 40,
      carbon_monoxide: 1000,
    })
    const equal = computeIndiaAqiAt(balanced, 23)
    expect(equal.value).toBe(50)
    expect(equal.dominant).toBe('pm2_5')

    const dusty = hourlyFixture({
      pm2_5: 30,
      pm10: 100,
      ozone: 50,
      nitrogen_dioxide: 40,
      sulphur_dioxide: 40,
      carbon_monoxide: 1000,
    })
    const result = computeIndiaAqiAt(dusty, 23)
    expect(result.value).toBe(100)
    expect(result.dominant).toBe('pm10')
  })

  it('matches the current hour and falls back to the latest hour', () => {
    const hourly = hourlyFixture({ pm2_5: 15 })
    expect(indiaAqiForHourly(hourly, '2026-11-14T23:00').value).toBe(25)
    expect(indiaAqiForHourly(hourly, '2026-11-15T04:00').value).toBe(25)
    expect(indiaAqiForHourly({ time: [] }, '2026-11-14T23:00').value).toBeNull()

    const series = buildIndiaSeries(hourly)
    expect(series).toHaveLength(24)
    expect(series?.[0]).toBeNull()
    expect(series?.[23]).toBe(25)
  })

  it('estimates the Indian AQI from instantaneous concentrations for the map', () => {
    const result = indiaAqiFromCurrent({
      pm2_5: 60,
      pm10: 50,
      ozone: 50,
      nitrogen_dioxide: 40,
      sulphur_dioxide: 40,
      carbon_monoxide: 1000,
    })
    expect(result.value).toBe(100)
    expect(result.dominant).toBe('pm2_5')

    expect(indiaAqiFromCurrent({}).value).toBeNull()
    expect(indiaAqiFromCurrent({}).dominant).toBeNull()
  })
})

describe('formatting helpers', () => {
  it('adds hours across midnight without timezone drift', () => {
    expect(addHoursLocal('2026-11-14T23:00', 2)).toBe('2026-11-15T01:00')
    expect(addHoursLocal('2026-12-31T22:00', 3)).toBe('2027-01-01T01:00')
  })

  it('formats hours and relative timestamps', () => {
    expect(hourLabel('2026-11-14T09:00')).toBe('09:00')
    expect(relativeTime(1_000_000, 1_020_000)).toBe('just now')
    expect(relativeTime(1_000_000, 1_000_000 + 5 * 60_000)).toBe('5 min ago')
    expect(relativeTime(1_000_000, 1_000_000 + 3 * 60 * 60_000)).toBe('3 hours ago')
  })

  it('labels wind, UV, weather codes and flags', () => {
    expect(windDirectionLabel(0)).toBe('N')
    expect(windDirectionLabel(225)).toBe('SW')
    expect(windDirectionLabel(null)).toBe('—')
    expect(uvLabel(12).label).toBe('Extreme')
    expect(uvLabel(0).label).toBe('Low')
    expect(weatherLabel(0).label).toBe('Clear sky')
    expect(weatherLabel(95).label).toBe('Thunderstorm')
    expect(weatherLabel(9999).label).toBe('Mixed')
    expect(flagEmoji('IN')).toBe('🇮🇳')
    expect(flagEmoji(undefined)).toBe('🌍')
  })

  it('computes WHO ratios safely', () => {
    expect(whoRatio(30, 15)).toBe(2)
    expect(whoRatio(null, 15)).toBeNull()
    expect(whoRatio(30, 0)).toBeNull()
  })
})
