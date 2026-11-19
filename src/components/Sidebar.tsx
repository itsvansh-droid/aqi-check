import { flagEmoji } from '../lib/aqi'
import type { Location } from '../lib/types'
import { CloseIcon, LocateIcon, LogoMark, StarIcon } from './Icons'

interface SidebarProps {
  favorites: Location[]
  recent: Location[]
  activeId: string
  locating: boolean
  onSelect: (location: Location) => void
  onRemoveFavorite: (id: string) => void
  onUseLocation: () => void
  onSearchFocus: () => void
}

function PlaceRow({
  location,
  active,
  onSelect,
  onRemove,
}: {
  location: Location
  active: boolean
  onSelect: () => void
  onRemove?: () => void
}) {
  return (
    <div className={`place-row ${active ? 'is-active' : ''}`}>
      <button type="button" className="place-main" onClick={onSelect} title={location.name}>
        <span className="place-flag" aria-hidden="true">
          {flagEmoji(location.countryCode)}
        </span>
        <span className="place-text">
          <strong>{location.name}</strong>
          <span>{[location.admin1, location.country].filter(Boolean).join(', ') || 'Pinned place'}</span>
        </span>
        {active && <span className="place-live" aria-label="Currently viewing" />}
      </button>
      {onRemove && (
        <button
          type="button"
          className="place-remove"
          onClick={onRemove}
          aria-label={`Remove ${location.name} from saved places`}
          title="Remove"
        >
          <CloseIcon size={13} />
        </button>
      )}
    </div>
  )
}

export function Sidebar({
  favorites,
  recent,
  activeId,
  locating,
  onSelect,
  onRemoveFavorite,
  onUseLocation,
  onSearchFocus,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <LogoMark size={38} />
        <div>
          <span className="brand-name">aero</span>
          <span className="brand-tag">Air quality, everywhere</span>
        </div>
      </div>

      <button type="button" className="sidebar-locate" onClick={onUseLocation} disabled={locating}>
        <LocateIcon size={16} />
        <span>{locating ? 'Finding you…' : 'Use my location'}</span>
      </button>

      <section className="sidebar-section">
        <header className="sidebar-heading">
          <span>
            <StarIcon size={13} filled /> Saved places
          </span>
          <span className="sidebar-count">{favorites.length}</span>
        </header>

        {favorites.length === 0 ? (
          <div className="sidebar-empty">
            <p>Pin the places you check often.</p>
            <button type="button" onClick={onSearchFocus}>
              Search for a city
            </button>
          </div>
        ) : (
          <div className="place-list">
            {favorites.map((location) => (
              <PlaceRow
                key={location.id}
                location={location}
                active={location.id === activeId}
                onSelect={() => onSelect(location)}
                onRemove={() => onRemoveFavorite(location.id)}
              />
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="sidebar-section">
          <header className="sidebar-heading">
            <span>Recent</span>
          </header>
          <div className="place-list">
            {recent
              .filter((location) => !favorites.some((favorite) => favorite.id === location.id))
              .slice(0, 4)
              .map((location) => (
                <PlaceRow
                  key={location.id}
                  location={location}
                  active={location.id === activeId}
                  onSelect={() => onSelect(location)}
                />
              ))}
          </div>
        </section>
      )}

      <div className="sidebar-footer">
        <div className="about-card">
          <span className="about-title">Live data, no keys</span>
          <p>
            Air quality from the <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>{' '}
            air quality model. Read the <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">API docs</a>.
          </p>
        </div>
        <span className="sidebar-credit">Aero · built for curious lungs</span>
      </div>
    </aside>
  )
}
