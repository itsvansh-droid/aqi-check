export function SkeletonLine({ width = '100%', height = 14 }: { width?: string; height?: number }) {
  return <span className="skeleton-line" style={{ width, height }} aria-hidden="true" />
}

export function NowSkeleton() {
  return (
    <div className="now" aria-busy="true" aria-label="Loading air quality">
      <div className="card hero-skeleton">
        <div className="skeleton-gauge" aria-hidden="true" />
        <div className="skeleton-hero-copy">
          <SkeletonLine width="34%" height={12} />
          <SkeletonLine width="62%" height={38} />
          <SkeletonLine width="44%" height={14} />
          <SkeletonLine width="88%" height={14} />
          <SkeletonLine width="72%" height={14} />
          <div className="skeleton-stats">
            <SkeletonLine width="22%" height={54} />
            <SkeletonLine width="22%" height={54} />
            <SkeletonLine width="22%" height={54} />
            <SkeletonLine width="22%" height={54} />
          </div>
        </div>
      </div>
      <div className="now-grid">
        <div className="card panel skeleton-panel">
          <SkeletonLine width="32%" height={18} />
          <div className="skeleton-chart" aria-hidden="true" />
        </div>
        <div className="card panel skeleton-panel">
          <SkeletonLine width="48%" height={18} />
          <SkeletonLine width="100%" height={14} />
          <SkeletonLine width="86%" height={14} />
          <SkeletonLine width="92%" height={14} />
          <SkeletonLine width="64%" height={14} />
        </div>
      </div>
      <div className="card panel skeleton-panel">
        <SkeletonLine width="26%" height={18} />
        <div className="skeleton-pollutants">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLine key={index} width="100%" height={92} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function GlobalSkeleton() {
  return (
    <div className="global" aria-busy="true" aria-label="Loading global air quality">
      <div className="stat-cards">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="card stat-card" key={index}>
            <SkeletonLine width="55%" height={12} />
            <SkeletonLine width="70%" height={24} />
            <SkeletonLine width="40%" height={12} />
          </div>
        ))}
      </div>
      <div className="global-grid">
        <div className="card panel skeleton-panel">
          <SkeletonLine width="28%" height={18} />
          <div className="skeleton-map" aria-hidden="true" />
        </div>
        <div className="card panel skeleton-panel">
          <SkeletonLine width="46%" height={18} />
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonLine key={index} width="100%" height={34} />
          ))}
        </div>
      </div>
    </div>
  )
}
