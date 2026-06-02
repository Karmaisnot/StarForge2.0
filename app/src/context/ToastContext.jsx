import { cloneElement, createContext, useCallback, useContext, useRef, useState } from 'react';
import { Icons } from '../components/Icons.jsx';

const ToastContext = createContext(null);

const TONE_ICON = {
  success: Icons.check,
  info: Icons.bell,
  warn: Icons.flag,
  danger: Icons.x,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idRef.current;
      const tone = toast.tone || 'success';
      setToasts((list) => [...list, { id, tone, ...toast }]);
      setTimeout(() => dismiss(id), toast.duration || 3200);
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="sf-toaster">
        {toasts.map((t) => (
          <div key={t.id} className="sf-toast">
            <span className={'sf-toast-ic ' + t.tone}>{cloneElement(TONE_ICON[t.tone], { size: 16 })}</span>
            <div>
              <div className="sf-toast-t">{t.title}</div>
              {t.desc && <div className="sf-toast-d">{t.desc}</div>}
            </div>
            <button className="sf-toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              {cloneElement(Icons.x, { size: 14 })}
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
