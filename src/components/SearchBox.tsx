import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { describeError, isAbortError } from '../lib/http'
import { searchLocations } from '../lib/openMeteo'
import { compactNumber } from '../lib/format'
import { flagEmoji } from '../lib/aqi'
import type { Location } from '../lib/types'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { CloseIcon, LocateIcon, MapPinIcon, SearchIcon } from './Icons'

interface SearchBoxProps {
  onSelect: (location: Location) => void
  onUseLocation: () => void
  locating?: boolean
  recent?: Location[]
  inputRef?: RefObject<HTMLInputElement | null>
}

export function SearchBox({ onSelect, onUseLocation, locating, recent = [], inputRef }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounced = useDebouncedValue(query, 280)
  const containerRef = useRef<HTMLDivElement>(null)
  const localInputRef = useRef<HTMLInputElement>(null)
  const resolvedInputRef = inputRef ?? localInputRef

  useEffect(() => {
    const trimmed = debounced.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    let cancelled = false
    setLoading(true)
    setError(null)

    searchLocations(trimmed, controller.signal)
      .then((found) => {
        if (cancelled) return
        setResults(found)
        setActiveIndex(found.length > 0 ? 0 : -1)
        setLoading(false)
      })
      .catch((caught) => {
        if (cancelled || isAbortError(caught)) return
        setError(describeError(caught))
        setResults([])
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debounced])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const choose = (location: Location) => {
    onSelect(location)
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    resolvedInputRef.current?.blur()
  }

  const showRecent = query.trim().length < 2

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      resolvedInputRef.current?.blur()
      return
    }
    if (!open) setOpen(true)
    if (showRecent || results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      choose(results[activeIndex])
    }
  }

  return (
    <div className="search" ref={containerRef}>
      <div className={`search-field ${open ? 'is-open' : ''}`}>
        <SearchIcon size={18} className="search-icon" />
        <input
          ref={resolvedInputRef}
          type="search"
          value={query}
          placeholder="Search any city, town, or place…"
          aria-label="Search for a location"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setResults([])
              resolvedInputRef.current?.focus()
            }}
          >
            <CloseIcon size={14} />
          </button>
        )}
        <kbd className="search-hint" aria-hidden="true">
          /
        </kbd>
      </div>

      {open && (
        <div className="search-panel" id="search-results" role="listbox" aria-label="Search results">
          <button
            type="button"
            className="search-locate"
            onClick={() => {
              setOpen(false)
              onUseLocation()
            }}
            disabled={locating}
          >
            <span className="search-result-icon">
              <LocateIcon size={16} />
            </span>
            <span className="search-result-text">
              <strong>{locating ? 'Finding you…' : 'Use my current location'}</strong>
              <span>Precise air quality where you are right now</span>
            </span>
          </button>

          {showRecent && recent.length > 0 && (
            <div className="search-section">
              <span className="search-section-label">Recent</span>
              {recent.slice(0, 5).map((location) => (
                <button
                  key={location.id}
                  type="button"
                  className="search-result"
                  onClick={() => choose(location)}
                  role="option"
                  aria-selected={false}
                >
                  <span className="search-result-icon">{flagEmoji(location.countryCode)}</span>
                  <span className="search-result-text">
                    <strong>{location.name}</strong>
                    <span>{[location.admin1, location.country].filter(Boolean).join(', ')}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {showRecent && recent.length === 0 && (
            <div className="search-empty">
              <MapPinIcon size={18} />
              <p>Search for a city to see its live air quality.</p>
            </div>
          )}

          {!showRecent && loading && (
            <div className="search-empty">
              <span className="spinner" aria-hidden="true" />
              <p>Searching places…</p>
            </div>
          )}

          {!showRecent && !loading && error && <div className="search-empty search-error">{error}</div>}

          {!showRecent && !loading && !error && results.length === 0 && (
            <div className="search-empty">
              <p>No places found for “{debounced.trim()}”. Try another spelling.</p>
            </div>
          )}

          {!showRecent &&
            !loading &&
            results.map((location, index) => (
              <button
                key={`${location.id}-${index}`}
                id={`search-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`search-result ${index === activeIndex ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(location)}
              >
                <span className="search-result-icon">{flagEmoji(location.countryCode)}</span>
                <span className="search-result-text">
                  <strong>{location.name}</strong>
                  <span>{[location.admin1, location.country].filter(Boolean).join(', ')}</span>
                </span>
                {location.population ? (
                  <span className="search-result-meta">{compactNumber(location.population)}</span>
                ) : null}
              </button>
            ))}

          <div className="search-foot">Live data from Open-Meteo · no API key needed</div>
        </div>
      )}
    </div>
  )
}
