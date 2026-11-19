import { AlertIcon, RefreshIcon } from './Icons'

interface ErrorCardProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorCard({ title = 'Air quality is out of reach', message, onRetry }: ErrorCardProps) {
  return (
    <div className="card error-card" role="alert">
      <span className="error-icon">
        <AlertIcon size={22} />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button primary" onClick={onRetry}>
          <RefreshIcon size={16} /> Try again
        </button>
      )}
      <span className="error-hint">The service is free and keyless, but it does need an internet connection.</span>
    </div>
  )
}
