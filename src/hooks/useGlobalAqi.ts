import { useCallback, useEffect, useState } from 'react'
import { clearApiCache, describeError, isAbortError } from '../lib/http'
import { indiaAqiFromCurrent } from '../lib/aqi'
import { GLOBAL_CITIES } from '../lib/cities'
import { fetchBatchAirQuality } from '../lib/openMeteo'
import type { GlobalCityReading, GlobalSnapshot } from '../lib/types'

interface State {
  status: 'idle' | 'loading' | 'ready' | 'error'
  data: GlobalSnapshot | null
  error: string | null
  refreshing: boolean
}

const initialState: State = { status: 'idle', data: null, error: null, refreshing: false }

export function useGlobalAqi(enabled: boolean) {
  const [state, setState] = useState<State>(initialState)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    clearApiCache()
    setRefreshKey((key) => key + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    let cancelled = false

    setState((previous) => ({
      status: previous.data ? 'ready' : 'loading',
      data: previous.data,
      error: null,
      refreshing: Boolean(previous.data),
    }))

    const load = async () => {
      try {
        const results = await fetchBatchAirQuality(GLOBAL_CITIES, controller.signal)
        if (cancelled) return
        const readings: GlobalCityReading[] = GLOBAL_CITIES.map((city) => {
          const air = results.get(city.id)
          const india = air ? indiaAqiFromCurrent(air.current) : null
          return {
            location: city,
            continent: city.continent,
            aqi: air?.current.us_aqi ?? null,
            euAqi: air?.current.european_aqi ?? null,
            indiaAqi: india?.value ?? null,
            dominant: india?.dominant ?? null,
            pm25: air?.current.pm2_5 ?? null,
            time: air?.current.time ?? '',
            error: air ? undefined : 'Unavailable',
          }
        })
        setState({
          status: 'ready',
          data: { readings, fetchedAt: Date.now() },
          error: null,
          refreshing: false,
        })
      } catch (error) {
        if (cancelled || isAbortError(error)) return
        setState({
          status: 'error',
          data: null,
          error: describeError(error),
          refreshing: false,
        })
      }
    }

    void load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, refreshKey])

  return { ...state, refresh }
}
