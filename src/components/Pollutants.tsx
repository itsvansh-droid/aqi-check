import { POLLUTANTS, formatConcentration, pollutantValue, whoRatio } from '../lib/aqi'
import type { AirCurrent } from '../lib/types'

interface PollutantsProps {
  current: AirCurrent
}

const SCALE_LIMIT = 3

function ratioColor(ratio: number | null): string {
  if (ratio == null) return 'var(--faint)'
  if (ratio <= 0.5) return '#34d399'
  if (ratio <= 1) return '#a3e635'
  if (ratio <= 2) return '#fbbf24'
  if (ratio <= 3) return '#fb923c'
  return '#f87171'
}

function ratioLabel(ratio: number | null): string {
  if (ratio == null) return 'No reading'
  if (ratio <= 1) return `${Math.round(ratio * 100)}% of WHO limit`
  return `${ratio.toFixed(1)}× WHO limit`
}

export function Pollutants({ current }: PollutantsProps) {
  return (
    <section className="card panel">
      <div className="panel-head">
        <div>
          <h2>Pollutants</h2>
          <p>Ground-level concentrations compared with WHO 2021 air quality guidelines.</p>
        </div>
        <span className="chip subtle">µg/m³</span>
      </div>

      <div className="pollutant-grid">
        {POLLUTANTS.map((pollutant) => {
          const raw = pollutantValue(current, pollutant.key)
          const value = raw == null ? null : Math.round(raw * 100) / 100
          const ratio = whoRatio(value, pollutant.guideline)
          const color = ratioColor(ratio)
          const fill = ratio == null ? 0 : Math.min(100, (ratio / SCALE_LIMIT) * 100)

          return (
            <article className="pollutant" key={pollutant.key} title={pollutant.description}>
              <div className="pollutant-head">
                <span className="pollutant-symbol">{pollutant.symbol}</span>
                <span className="pollutant-name">{pollutant.name}</span>
              </div>
              <div className="pollutant-value">
                {formatConcentration(value)}
                <span className="pollutant-unit">µg/m³</span>
              </div>
              <div className="ratio-track" aria-hidden="true">
                <span className="ratio-fill" style={{ width: `${fill}%`, background: color }} />
                <span className="ratio-marker" />
              </div>
              <div className="pollutant-foot">
                <span style={{ color }}>{ratioLabel(ratio)}</span>
                <span className="pollutant-who">
                  WHO {pollutant.guideline} · {pollutant.guidelinePeriod}
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <p className="pollutant-note">
        The thin marker sits at the WHO guideline. Bars extend to three times that level. While these
        thresholds describe long-term risk, the AQI above reflects today's combined health risk.
      </p>
    </section>
  )
}
