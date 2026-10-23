import { useState } from 'react';

export default function Dropdown({
  trigger,
  children,
  className = '',
  menuClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const toggle = () => setOpen((current) => !current);

  return (
    <div className={className}>
      {trigger({ open, toggle, close })}
      {open && (
        <div
          className={menuClassName}
          onClick={(event) => {
            if (event.target.closest('a, button')) close();
          }}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
