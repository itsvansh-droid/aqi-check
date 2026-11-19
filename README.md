# Aero

**Live air quality for anywhere on Earth.** Aero is a fast, dark-glass dashboard built on the
keyless Open-Meteo APIs. It defaults to the **Indian AQI (CPCB)** and also supports the US EPA and
European scales. Search any city, town, or place, or open the global map to compare 71 major cities
at a glance.

## Features

- **Anywhere search** — global geocoding with debounced results, keyboard navigation, favorites, and
  recent places saved locally.
- **Three AQI scales** — Indian (CPCB), US EPA, and European, with Indian AQI as the default. The
  gauge, categories, health guidance, chart, dominant pollutant, and ranking all follow your choice.
- **Health-first detail** — category guidance for the general population and sensitive groups, a
  WHO 2021 pollutant comparison, UV, wind, humidity, and conditions.
- **Forecasts and insight** — a 24-hour trend, a five-day outlook aggregated from hourly data, and
  the calmest three-hour window in the next day.
- **Global map** — a searchable, sortable ranking of 71 cities across six continents, paired with a
  Leaflet map on CARTO dark tiles. Marker size and colour encode the current AQI.
- **Shareable and resilient** — location and view live in the URL; requests have timeouts, bounded
  retries, a TTL cache, and per-chunk failure isolation.
- **Polished and accessible** — responsive layouts, reduced-motion support, keyboard shortcuts
  (`/` focuses search), and an in-place skeleton/error experience.

## Stack

React 19 · TypeScript · Vite 7 · Leaflet · plain CSS design system · Vitest + Testing Library.

No API keys, accounts, or environment variables are required.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to <http://localhost:5173>).

### Scripts

| Script              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR.          |
| `npm run build`     | Type-check the project and build production. |
| `npm run preview`   | Serve the production build locally.          |
| `npm test`          | Run the Vitest suite once.                   |
| `npm run test:watch`| Run Vitest in watch mode.                    |
| `npm run typecheck` | Type-check without emitting output.          |

## Data sources

| Data                        | Source                                                        |
| --------------------------- | ------------------------------------------------------------- |
| Air quality (pollutants, hourly forecast, US/EU AQI) | [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) |
| Place search                | [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) |
| Temperature, wind, humidity | [Open-Meteo Forecast](https://open-meteo.com/en/docs) |
| Reverse geocoding           | [BigDataCloud](https://www.bigdatacloud.com/) |
| Map tiles                   | CARTO dark basemap © OpenStreetMap contributors |

Daily highs and averages are aggregated client-side from the hourly series.

## Indian AQI method

Open-Meteo does not publish an Indian AQI field, so Aero computes it in the browser from live
pollutant concentrations using the official CPCB / National AQI method:

1. Build a **24-hour rolling average** for PM₂.₅, PM₁₀, NO₂, and SO₂, and an **8-hour rolling
   average** for O₃ and CO (converted from µg/m³ to the CPCB table's mg/m³). The request includes
   one past day so these windows are complete.
2. Convert each average to a **sub-index** with the CPCB linear-interpolation breakpoints.
3. The Indian AQI is the **maximum sub-index**; the pollutant that produces it is shown as the
   **dominant pollutant**.

Values are live model data and a faithful CPCB calculation, but they are not official CPCB station
telemetry. The global map uses instantaneous concentrations for speed, so its values are estimates
rather than station averages.

## Project structure

```
src/
  components/   UI — dashboard, gauge, charts, map, search, sidebar
  hooks/        Data loading and small UI utilities
  lib/          AQI math, API clients, storage, formatting, city data
  styles/       Design tokens, base, layout, components, map, responsive
  __tests__/    Unit and component tests
```

## Notes

Air quality values are model estimates intended for awareness, not medical advice. All services are
free and keyless, so the app needs an internet connection but no configuration.
