import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = '',
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`request-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <button
          className="icon-button modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={19} />
        </button>
        {title && <h2 id="modal-title" className="ui-modal-title">{title}</h2>}
        {children}
      </section>
    </div>
  );
}
