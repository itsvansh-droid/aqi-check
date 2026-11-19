import { useCallback, useEffect, useState } from 'react'
import { describeError, isAbortError } from '../lib/http'
import { fetchAirQuality, fetchWeather } from '../lib/openMeteo'
import type { Location, LocationReading, WeatherInfo } from '../lib/types'

interface State {
  status: 'idle' | 'loading' | 'ready' | 'error'
  data: LocationReading | null
  error: string | null
  refreshing: boolean
}

const initialState: State = { status: 'idle', data: null, error: null, refreshing: false }

const AUTO_REFRESH_MS = 15 * 60 * 1000

/**
 * Load air quality (immediately) and weather (opportunistically) for a place.
 * Weather failures never block the dashboard.
 */
export function useAirQuality(location: Location | null) {
  const [state, setState] = useState<State>(initialState)
  const [refreshKey, setRefreshKey] = useState(0)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') setTick((value) => value + 1)
    }, AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!location) {
      setState(initialState)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    setState((previous) => {
      const samePlace = previous.data?.location.id === location.id
      return {
        status: 'loading',
        data: samePlace ? previous.data : null,
        error: null,
        refreshing: samePlace,
      }
    })

    const load = async () => {
      // Weather runs alongside the primary request and paints in when ready.
      let weather: WeatherInfo | null = null
      fetchWeather(location.latitude, location.longitude, controller.signal)
        .then((resolved) => {
          weather = resolved
          if (cancelled) return
          setState((previous) => {
            if (!previous.data || previous.data.location.id !== location.id) return previous
            return { ...previous, data: { ...previous.data, weather: resolved } }
          })
        })
        .catch(() => {
          // Conditions are a nice-to-have; ignore failures.
        })

      try {
        const air = await fetchAirQuality(location.latitude, location.longitude, controller.signal)
        if (cancelled) return
        setState({
          status: 'ready',
          data: { location, air, weather, fetchedAt: Date.now() },
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
  }, [location, refreshKey, tick])

  return { ...state, refresh }
}
