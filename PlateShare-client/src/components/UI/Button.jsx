import { Link } from 'react-router-dom';

export default function Button({
  children,
  to,
  as,
  variant = 'dark',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const Component = as || (to ? Link : 'button');
  const componentProps = to ? { to } : { type };
  const disabledProps =
    Component === 'button' ? { disabled: disabled || loading } : {};

  return (
    <Component
      {...componentProps}
      {...props}
      {...disabledProps}
      className={`button button-${variant} button-${size} ${className}`.trim()}
      aria-busy={loading || undefined}
    >
      {children}
    </Component>
  );
}
