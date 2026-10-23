export default function Table({ children, className = '' }) {
  return <div className={`table-wrap ${className}`.trim()}>{children}</div>;
}
