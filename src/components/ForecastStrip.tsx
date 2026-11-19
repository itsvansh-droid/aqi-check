import { dayLabel, shortDate } from '../lib/format'
import { formatAqi, getCategory, SCALE_MAX, STANDARD_LABEL } from '../lib/aqi'
import type { DailySummary, Standard } from '../lib/types'

interface ForecastStripProps {
  days: DailySummary[]
  standard: Standard
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function weekdayName(date: string): string {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? date : DAY_NAMES[parsed.getDay()]
}

export function ForecastStrip({ days, standard }: ForecastStripProps) {
  if (days.length === 0) {
    return (
      <section className="card panel">
        <div className="panel-head">
          <div>
            <h2>5-day outlook</h2>
            <p>Daily average air quality.</p>
          </div>
        </div>
        <p className="empty-note">The forecast is not available for this location yet.</p>
      </section>
    )
  }

  const scale = SCALE_MAX[standard]

  return (
    <section className="card panel">
      <div className="panel-head">
        <div>
          <h2>5-day outlook</h2>
          <p>Daily average {STANDARD_LABEL[standard]}, with the day's range.</p>
        </div>
        <span className="chip subtle">Forecast</span>
      </div>

      <div className="forecast-grid">
        {days.map((day, index) => {
          const category = getCategory(day.avg, standard)
          const minCategory = getCategory(day.min, standard)
          const maxCategory = getCategory(day.max, standard)
          const left = Math.min(94, (day.min / scale) * 100)
          const width = Math.max(6, Math.min(100 - left, ((day.max - day.min) / scale) * 100))
          return (
            <article
              key={day.date}
              className="forecast-day"
              title={`${weekdayName(day.date)} · ${category.label} · peak at ${
                day.peakHour ? day.peakHour.slice(11, 16) : '—'
              }`}
              aria-label={`${weekdayName(day.date)}: average AQI ${day.avg}, ranging from ${day.min} to ${day.max}`}
            >
              <header>
                <span className="forecast-name">{dayLabel(day.date, index)}</span>
                <span className="forecast-date">{shortDate(day.date)}</span>
              </header>
              <div className="forecast-value" style={{ color: category.color }}>
                {formatAqi(day.avg, standard)}
              </div>
              <div className="forecast-category" style={{ color: category.color }}>
                {category.short}
              </div>
              <div className="range-track" aria-hidden="true">
                <span
                  className="range-fill"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${minCategory.color}, ${maxCategory.color})`,
                  }}
                />
              </div>
              <div className="range-labels">
                <span>{day.min}</span>
                <span>{day.max}</span>
              </div>
            </article>
          )
        })}
      </div>

      <p className="forecast-note">
        Daily values are aggregated from hourly model output. Hover a day for its peak hour.
      </p>
    </section>
  )
}
