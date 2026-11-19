interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number
}

const defaults = (size = 18, strokeWidth = 1.8) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
})

export function SearchIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function MapPinIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M20 10.2c0 5.5-8 11.3-8 11.3S4 15.7 4 10.2a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.7" />
    </svg>
  )
}

export function LocateIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )
}

export function StarIcon({ size, className, strokeWidth, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className} fill={filled ? 'currentColor' : 'none'}>
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />
    </svg>
  )
}

export function RefreshIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 3.5V9H15" />
    </svg>
  )
}

export function GlobeIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.7 5.6 3.7 9s-1.2 6.5-3.7 9c-2.5-2.5-3.7-5.6-3.7-9S9.5 5.5 12 3Z" />
    </svg>
  )
}

export function WindIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M3 8h11.5a2.8 2.8 0 1 0-2.8-2.8" />
      <path d="M3 12.5h15a2.8 2.8 0 1 1-2.8 2.8" />
      <path d="M3 17h7.5" />
    </svg>
  )
}

export function DropletIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M12 3s6 6.2 6 10.4a6 6 0 0 1-12 0C6 9.2 12 3 12 3Z" />
    </svg>
  )
}

export function ThermometerIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" />
    </svg>
  )
}

export function SunIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2 12h2M20 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5" />
    </svg>
  )
}

export function CloseIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function AlertIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function SparklesIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.7l-1.6-5.5L5 10.6 10.4 9 12 3.5Z" />
      <path d="M18.5 3v3M20 4.5h-3M5.5 17v3M7 18.5H4" />
    </svg>
  )
}

export function ArrowUpRightIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

export function ChevronDownIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function LeafIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <path d="M20 4c-9 0-15 4.5-15 11a5 5 0 0 0 5 5c6.5 0 10-6.7 10-16Z" />
      <path d="M4 21c2-5 6-9 11-11" />
    </svg>
  )
}

export function InfoIcon({ size, className, strokeWidth }: IconProps) {
  return (
    <svg {...defaults(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

/** Brand mark: a rising sun over a horizon line. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="aero-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="0.6" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="17" fill="rgba(56,189,248,0.1)" stroke="rgba(125,211,252,0.25)" />
      <path d="M17 40c0-9.4 7.6-17 17-17s17 7.6 17 17" fill="none" stroke="url(#aero-mark)" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="34" cy="40" r="4" fill="#e2f5ff" />
      <path d="M24 48h20" stroke="url(#aero-mark)" strokeWidth="4.5" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}
