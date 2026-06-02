import { cloneElement, useEffect, useRef } from 'react';
import { Icons } from './Icons.jsx';

// Presentational dialog shell — header (icon, title, sub, close), body, footer.
// Pure UI: it owns no domain state, only layout + focus + the close affordance.
export function Modal({ title, sub, icon, tone = 'primary', size = 'md', onClose, footer, children }) {
  const panelRef = useRef(null);

  // Move focus into the dialog on mount so keyboard users land in context.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className={`sf-modal sf-modal-${size}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      ref={panelRef}
    >
      <div className="sf-modal-h">
        {icon && <span className={`sf-modal-ic ${tone}`}>{cloneElement(icon, { size: 17 })}</span>}
        <div className="sf-modal-ht">
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        <button className="sf-modal-x" onClick={onClose} aria-label="Close">
          {cloneElement(Icons.x, { size: 16 })}
        </button>
      </div>
      <div className="sf-modal-b">{children}</div>
      {footer && <div className="sf-modal-f">{footer}</div>}
    </div>
  );
}
