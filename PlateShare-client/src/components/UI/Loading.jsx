export default function Loading({
  label = 'Loading PlateShare…',
  className = '',
}) {
  return (
    <div className={`page-loading ${className}`.trim()} role="status">
      <span className="loading-spinner" /> {label}
    </div>
  );
}

export function StatusState({
  title = 'Something went wrong',
  message,
  action,
  variant = 'error',
}) {
  return (
    <div className={`status-state status-state-${variant}`} role="alert">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title = 'Nothing here yet',
  message,
  action,
  compact = false,
}) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`.trim()}>
      {icon}
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function FoodCardSkeleton() {
  return (
    <article className="food-card skeleton-card" aria-hidden="true">
      <div className="food-card-image skeleton-block" />
      <div className="food-card-content">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-copy" />
        <div className="skeleton-block skeleton-copy short" />
      </div>
    </article>
  );
}
