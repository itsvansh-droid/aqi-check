import { describe, expect, it, vi } from 'vitest'
import {
  buildAirQualityUrl,
  buildBatchAirQualityUrl,
  buildGeocodeUrl,
  buildReverseGeocodeUrl,
  buildWeatherUrl,
  fetchAirQuality,
  fetchBatchAirQuality,
  fetchWeather,
  normalizeGeocodeResult,
  reverseGeocode,
  searchLocations,
  type BatchPoint,
} from '../lib/openMeteo'

const jsonResponse = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }) as unknown as Response

const airPayload = {
  latitude: 28.614,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  timezone_abbreviation: 'IST',
  utc_offset_seconds: 19_800,
  current_units: { us_aqi: 'USAQI', pm2_5: 'μg/m³' },
  current: { time: '2026-11-14T10:00', interval: 3600, us_aqi: 168, pm2_5: 58.4 },
  hourly: { time: ['2026-11-14T10:00'], us_aqi: [168], pm2_5: [58.4] },
}

describe('Open-Meteo URL builders', () => {
  it('requests current, hourly, and five forecast days without unsupported daily params', () => {
    const url = new URL(buildAirQualityUrl(28.6139, 77.209))
    expect(url.origin + url.pathname).toBe('https://air-quality-api.open-meteo.com/v1/air-quality')
    expect(url.searchParams.get('latitude')).toBe('28.6139')
    expect(url.searchParams.get('longitude')).toBe('77.209')
    expect(url.searchParams.get('current')).toContain('us_aqi')
    expect(url.searchParams.get('current')).toContain('uv_index')
    expect(url.searchParams.get('hourly')).toBe(
      'us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide',
    )
    expect(url.searchParams.get('forecast_days')).toBe('5')
    expect(url.searchParams.get('past_days')).toBe('1')
    expect(url.searchParams.get('timezone')).toBe('auto')
    expect(url.searchParams.has('daily')).toBe(false)
  })

  it('joins batch coordinates in order with three decimals', () => {
    const url = new URL(
      buildBatchAirQualityUrl([
        { latitude: 28.6139, longitude: 77.209 },
        { latitude: -0.1278, longitude: 51.50741 },
      ]),
    )
    expect(url.searchParams.get('latitude')).toBe('28.614,-0.128')
    expect(url.searchParams.get('longitude')).toBe('77.209,51.507')
    expect(url.searchParams.get('current')).toBe(
      'us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide',
    )
  })

  it('encodes search, weather, and reverse geocode parameters', () => {
    const geo = new URL(buildGeocodeUrl('São Paulo & Rio'))
    expect(geo.searchParams.get('name')).toBe('São Paulo & Rio')
    expect(geo.searchParams.get('count')).toBe('8')

    const weather = new URL(buildWeatherUrl(51.5, -0.12))
    expect(weather.searchParams.get('current')).toContain('temperature_2m')
    expect(weather.searchParams.get('current')).toContain('weather_code')

    const reverse = new URL(buildReverseGeocodeUrl(51.5, -0.12))
    expect(reverse.searchParams.get('localityLanguage')).toBe('en')
  })
})

describe('geocoding', () => {
  it('normalises coordinates and optional fields into a Location', () => {
    expect(
      normalizeGeocodeResult({
        id: 123,
        name: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        admin1: 'Delhi',
        country: 'India',
        country_code: 'IN',
        timezone: 'Asia/Kolkata',
        population: 31_797_000,
        feature_code: 'PPLA',
      }),
    ).toEqual({
      id: '28.614,77.209',
      name: 'New Delhi',
      latitude: 28.614,
      longitude: 77.209,
      admin1: 'Delhi',
      country: 'India',
      countryCode: 'IN',
      timezone: 'Asia/Kolkata',
      population: 31_797_000,
    })
  })

  it('does not call the API for queries shorter than two characters', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchLocations('  a ')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps results and tolerates a missing results array', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          results: [
            { id: 1, name: 'Paris', latitude: 48.8566, longitude: 2.3522, country_code: 'FR' },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)

    const first = await searchLocations('Paris')
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({ name: 'Paris', latitude: 48.857, longitude: 2.352 })
    await expect(searchLocations('Nowhere')).resolves.toEqual([])
  })
})

describe('air quality requests', () => {
  it('returns a validated payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(airPayload))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchAirQuality(28.6139, 77.209)).resolves.toMatchObject({
      current: { us_aqi: 168 },
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed responses that have no current block', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ latitude: 1 })))

    await expect(fetchAirQuality(1, 2)).rejects.toThrow(/unexpected response/i)
  })

  it('batches 15 points per request and isolates a failing chunk', async () => {
    const points: BatchPoint[] = Array.from({ length: 31 }, (_, index) => ({
      id: `p${index}`,
      latitude: 10 + index,
      longitude: 20 + index,
    }))

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input))
      const coordinates = (url.searchParams.get('latitude') ?? '').split(',')
      // Fail the middle chunk only; the first and last must still resolve.
      if (coordinates.includes('26.000')) {
        return jsonResponse({ reason: 'Bad chunk' }, { ok: false, status: 400 })
      }
      return jsonResponse(
        coordinates.map((latitude) => ({
          latitude: Number(latitude),
          longitude: Number(latitude),
          timezone: 'UTC',
          timezone_abbreviation: 'UTC',
          utc_offset_seconds: 0,
          current_units: {},
          current: { time: '2026-11-14T10:00', us_aqi: Math.round(Number(latitude)) },
          hourly: { time: [] },
        })),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const results = await fetchBatchAirQuality(points)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(results.size).toBe(16)
    expect(results.get('p0')?.current.us_aqi).toBe(10)
    expect(results.get('p14')?.current.us_aqi).toBe(24)
    expect(results.has('p15')).toBe(false)
    expect(results.has('p16')).toBe(false)
    expect(results.get('p30')?.current.us_aqi).toBe(40)
  })

  it('skips readings without a current block', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          { current: { time: '2026-11-14T10:00', us_aqi: 30 } },
          { timezone: 'UTC' },
          null,
        ]),
      ),
    )

    const results = await fetchBatchAirQuality([
      { id: 'a', latitude: 1, longitude: 2 },
      { id: 'b', latitude: 3, longitude: 4 },
      { id: 'c', latitude: 5, longitude: 6 },
    ])

    expect([...results.keys()]).toEqual(['a'])
  })
})

describe('weather and reverse geocoding', () => {
  it('maps weather fields and unit fallbacks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          timezone: 'Europe/London',
          current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
          current: {
            time: '2026-11-14T10:00',
            temperature_2m: 12.4,
            apparent_temperature: 10.9,
            relative_humidity_2m: 81,
            wind_speed_10m: 18.2,
            wind_direction_10m: 225,
            weather_code: 3,
          },
        }),
      ),
    )

    await expect(fetchWeather(51.5, -0.12)).resolves.toEqual({
      temperature: 12.4,
      apparent: 10.9,
      humidity: 81,
      windSpeed: 18.2,
      windDirection: 225,
      code: 3,
      temperatureUnit: '°C',
      windUnit: 'km/h',
    })
  })

  it('falls back to a generic label when reverse geocoding fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))

    await expect(reverseGeocode(51.5074, -0.1278)).resolves.toEqual({
      id: '51.507,-0.128',
      name: 'My location',
      latitude: 51.507,
      longitude: -0.128,
    })
  })

  it('builds a friendly label from reverse geocode data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          city: 'London',
          principalSubdivision: 'England',
          countryName: 'United Kingdom',
          countryCode: 'GB',
        }),
      ),
    )

    await expect(reverseGeocode(51.5074, -0.1278)).resolves.toMatchObject({
      name: 'London',
      admin1: 'England',
      country: 'United Kingdom',
      countryCode: 'GB',
    })
  })
})
