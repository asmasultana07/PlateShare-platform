export default function Card({
  as: Element = 'div',
  className = '',
  padding = 'none',
  children,
  ...props
}) {
  return (
    <Element className={`ui-card ui-card-${padding} ${className}`.trim()} {...props}>
      {children}
    </Element>
  );
}
