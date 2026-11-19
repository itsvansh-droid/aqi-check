import type { AqiCategory, BestWindow, Standard } from '../lib/types'
import { hourLabel, STANDARD_LABEL } from '../lib/aqi'
import { InfoIcon, SparklesIcon } from './Icons'

interface HealthCardProps {
  category: AqiCategory
  standard: Standard
  bestWindow: BestWindow | null
}

export function HealthCard({ category, standard, bestWindow }: HealthCardProps) {
  return (
    <section className="card panel health">
      <div className="panel-head">
        <div>
          <h2>Health guidance</h2>
          <p>What today's air means for you.</p>
        </div>
        <span className="health-dot" style={{ background: category.color, boxShadow: `0 0 0 5px ${category.tint}` }} />
      </div>

      <p className="health-lead" style={{ color: category.color }}>
        {category.label}
      </p>
      <p className="health-body">{category.general}</p>

      <div className="advice-box">
        <span className="advice-label">Sensitive groups</span>
        <p>{category.sensitive}</p>
      </div>

      {bestWindow && (
        <div className="best-window">
          <span className="best-window-icon">
            <SparklesIcon size={16} />
          </span>
          <div>
            <span className="best-window-label">Calmest window ahead</span>
            <strong>
              {hourLabel(bestWindow.start)}–{hourLabel(bestWindow.end)}
            </strong>
            <p>
              Lowest {STANDARD_LABEL[standard]} in the next 24 hours · average{' '}
              <span style={{ color: category.color }}>{bestWindow.avg}</span>
            </p>
          </div>
        </div>
      )}

      <p className="health-source">
        <InfoIcon size={13} /> Based on {STANDARD_LABEL[standard]} health categories. Not medical advice.
      </p>
    </section>
  )
}
