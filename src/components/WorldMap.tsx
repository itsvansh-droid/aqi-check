import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { categoriesFor, formatAqi, getCategory, pollutantMeta } from '../lib/aqi'
import { escapeHtml } from '../lib/format'
import type { GlobalCityReading, Standard } from '../lib/types'

interface WorldMapProps {
  readings: GlobalCityReading[]
  standard: Standard
  onSelect: (reading: GlobalCityReading) => void
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function valueFor(reading: GlobalCityReading, standard: Standard): number | null {
  if (standard === 'in') return reading.indiaAqi
  return standard === 'us' ? reading.aqi : reading.euAqi
}

/** Radius divisor so markers use the full size range on each AQI scale. */
const RADIUS_DIVISOR: Record<Standard, number> = { in: 55, us: 34, eu: 11 }

export function WorldMap({ readings, standard, onSelect }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 8,
      scrollWheelZoom: false,
      worldCopyJump: true,
      preferCanvas: true,
    }).setView([24, 12], 2)

    L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
      noWrap: true,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    let resize: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resize = new ResizeObserver(() => map.invalidateSize())
      resize.observe(container)
    }

    return () => {
      resize?.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const layers = L.layerGroup().addTo(map)

    readings.forEach((reading) => {
      const value = valueFor(reading, standard)
      if (value == null) return
      const category = getCategory(value, standard)
      const radius = 5 + Math.min(9, value / RADIUS_DIVISOR[standard])

      const marker = L.circleMarker([reading.location.latitude, reading.location.longitude], {
        radius,
        color: category.color,
        weight: 1,
        opacity: 0.95,
        fillColor: category.color,
        fillOpacity: 0.45,
      })

      const dominant = standard === 'in' ? pollutantMeta(reading.dominant) : null

      marker.bindTooltip(
        `<div class="map-tip">
          <span class="map-tip-name">${escapeHtml(reading.location.name)}</span>
          <span class="map-tip-row">
            <strong style="color:${category.color}">${formatAqi(value, standard)}</strong>
            <span>${escapeHtml(category.short)}</span>
          </span>
          <span class="map-tip-country">${escapeHtml(reading.location.country ?? '')}${
            dominant ? ` · ${escapeHtml(dominant.symbol)}` : ''
          }</span>
        </div>`,
        { direction: 'top', className: 'map-tip-wrap', opacity: 1 },
      )

      marker.on('click', () => onSelectRef.current(reading))
      marker.addTo(layers)
    })

    return () => {
      layers.remove()
    }
  }, [readings, standard])

  return (
    <div className="map-frame">
      <div
        ref={containerRef}
        className="world-map"
        role="region"
        aria-label="Interactive world map of air quality by city"
      />
      <div className="map-legend">
        {categoriesFor(standard).map((category) => (
          <span key={category.key} className="map-legend-item">
            <span className="map-legend-dot" style={{ background: category.color }} />
            {category.short}
          </span>
        ))}
      </div>
      <div className="map-hint">Click a marker to open that city's dashboard</div>
    </div>
  )
}
