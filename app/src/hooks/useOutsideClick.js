import { useEffect, useRef, useState } from 'react';

// Toggle state for a popover that closes on outside-click or Escape.
export function usePopover(initial = false) {
  const [open, setOpen] = useState(initial);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return { open, setOpen, toggle: () => setOpen((v) => !v), ref };
}
