import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

const LOCATION_URL =
  '/?lat=28.6139&lon=77.209&name=New%20Delhi&region=Delhi&country=India&cc=IN'

// Start a day early so the CPCB 24h rolling averages have a full window.
const START = Date.UTC(2026, 10, 13, 0, 0)
const times = Array.from({ length: 120 }, (_, index) => {
  const date = new Date(START + index * 3_600_000)
  return date.toISOString().slice(0, 16)
})

const airFixture = {
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  timezone_abbreviation: 'IST',
  utc_offset_seconds: 19_800,
  elevation: 216,
  current_units: {
    us_aqi: 'USAQI',
    european_aqi: 'EUAQI',
    pm2_5: 'μg/m³',
    pm10: 'μg/m³',
    ozone: 'μg/m³',
    nitrogen_dioxide: 'μg/m³',
    sulphur_dioxide: 'μg/m³',
    carbon_monoxide: 'μg/m³',
    uv_index: '',
  },
  current: {
    time: '2026-11-14T10:00',
    interval: 3600,
    us_aqi: 168,
    european_aqi: 82,
    pm2_5: 58.4,
    pm10: 92,
    ozone: 71,
    nitrogen_dioxide: 34,
    sulphur_dioxide: 9,
    carbon_monoxide: 450,
    uv_index: 4.2,
  },
  hourly: {
    time: times,
    us_aqi: times.map((_, index) => 30 + ((index * 7) % 140)),
    european_aqi: times.map((_, index) => 10 + ((index * 3) % 80)),
    // Constant pollutant series make the CPCB result deterministic:
    // PM₂.₅ 25, PM₁₀ 40, O₃/NO₂/SO₂/CO 50 → Indian AQI 50 (Good).
    pm2_5: times.map(() => 15),
    pm10: times.map(() => 40),
    ozone: times.map(() => 50),
    nitrogen_dioxide: times.map(() => 40),
    sulphur_dioxide: times.map(() => 40),
    carbon_monoxide: times.map(() => 1000),
  },
}

const weatherFixture = {
  timezone: 'Asia/Kolkata',
  current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
  current: {
    time: '2026-11-14T10:00',
    temperature_2m: 24.6,
    apparent_temperature: 26.1,
    relative_humidity_2m: 47,
    wind_speed_10m: 12.3,
    wind_direction_10m: 225,
    weather_code: 0,
  },
}

const jsonResponse = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
  ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  }) as unknown as Response

function installApiMock(options: { airError?: boolean } = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.startsWith('https://air-quality-api.open-meteo.com')) {
      if (options.airError) {
        return jsonResponse({ reason: 'Bad coordinates' }, { ok: false, status: 400 })
      }
      return jsonResponse(airFixture)
    }
    if (url.startsWith('https://api.open-meteo.com/v1/forecast')) return jsonResponse(weatherFixture)
    if (url.startsWith('https://geocoding-api.open-meteo.com')) return jsonResponse({ results: [] })
    if (url.startsWith('https://api.bigdatacloud.net')) {
      return jsonResponse({ city: 'New Delhi', countryName: 'India', countryCode: 'IN' })
    }
    throw new Error(`Unexpected request: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('Aero dashboard', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', LOCATION_URL)
  })

  it('renders the live dashboard for the location in the URL', async () => {
    installApiMock()
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'New Delhi' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Indian AQI 50\. Good\./ }),
    ).toBeInTheDocument()
    expect(screen.getByText(/CPCB method/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'IN' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Pollutants' })).toBeInTheDocument()
    expect(screen.getByText('PM₂.₅')).toBeInTheDocument()
    expect(screen.getByText('Clear sky')).toBeInTheDocument()
    expect(
      screen.getAllByText('Air quality is good and poses little or no risk.').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('Feels like 26°')).toBeInTheDocument()
  })

  it('switches the whole dashboard to the US AQI standard', async () => {
    installApiMock()
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { level: 1, name: 'New Delhi' })
    await user.click(screen.getByRole('button', { name: 'US' }))

    expect(
      await screen.findByRole('img', { name: /US AQI 168\. Unhealthy\./ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'US' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/US AQI · live worldwide/)).toBeInTheDocument()
    expect(
      screen.getAllByText('Everyone may begin to experience health effects.').length,
    ).toBeGreaterThan(0)
  })

  it('switches the whole dashboard to the European AQI standard', async () => {
    installApiMock()
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { level: 1, name: 'New Delhi' })
    await user.click(screen.getByRole('button', { name: 'EU' }))

    expect(
      await screen.findByRole('img', { name: /European AQI 82\. Very poor\./ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EU' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/European AQI · live worldwide/)).toBeInTheDocument()
  })

  it('persists saved places in localStorage', async () => {
    installApiMock()
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { level: 1, name: 'New Delhi' })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: 'Saved' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('aero.favorites.v1') ?? '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({ name: 'New Delhi', countryCode: 'IN' })
    })
  })

  it('shows a friendly error card when the air quality request fails', async () => {
    installApiMock({ airError: true })
    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('Air quality is out of reach')).toBeInTheDocument()
    expect(alert).toHaveTextContent('Bad coordinates')
    expect(within(alert).getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('updates the document title and URL when a place is loaded', async () => {
    installApiMock()
    render(<App />)

    await screen.findByRole('heading', { level: 1, name: 'New Delhi' })
    await act(async () => {
      await Promise.resolve()
    })

    expect(document.title).toBe('New Delhi air quality · Aero')
    expect(window.location.search).toContain('lat=28.6139')
    expect(window.location.search).toContain('name=New+Delhi')
  })
})
