export default function Badge({ children, className = '', variant = 'neutral' }) {
  return (
    <span
      className={`ui-badge ${variant ? `ui-badge-${variant}` : ''} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
