import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ModalContext = createContext(null);

// Owns the modal stack and nothing else (SRP). Pages never hold open/close
// state themselves — they call `open(render)` and get a dismiss handle back.
// `render` is a function `({ close }) => ReactNode`, so the dialog body stays
// decoupled from how it is mounted (OCP: new dialog kinds need no changes here).
export function ModalProvider({ children }) {
  const [stack, setStack] = useState([]);
  const idRef = useRef(0);

  const close = useCallback((id) => {
    setStack((s) => s.filter((m) => m.id !== id));
  }, []);

  const open = useCallback((render) => {
    const id = ++idRef.current;
    setStack((s) => [...s, { id, render }]);
    return id;
  }, []);

  // While any modal is open: Esc dismisses the topmost, body scroll is locked.
  useEffect(() => {
    if (!stack.length) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setStack((s) => s.slice(0, -1));
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [stack.length]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {stack.map((m) => (
        <div
          key={m.id}
          className="sf-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(m.id);
          }}
        >
          {m.render({ close: () => close(m.id) })}
        </div>
      ))}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
