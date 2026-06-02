import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const PALETTES = ['saroy', 'marvarid', 'samarqand', 'daryo'];

const PreferencesContext = createContext(null);

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export function PreferencesProvider({ children }) {
  const [cur, setCurState] = useState(() => read('sf-currency', 'UZS'));
  const [theme, setThemeState] = useState(() => read('sf-theme', 'light'));
  const [palette, setPaletteState] = useState(() => read('sf-palette', 'saroy'));

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-palette', palette);
  }, [theme, palette]);

  const persist = (key, value, setter) => {
    setter(value);
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — keep in-memory state */
    }
  };

  const value = useMemo(
    () => ({
      cur,
      setCur: (v) => persist('sf-currency', v, setCurState),
      theme,
      setTheme: (v) => persist('sf-theme', v, setThemeState),
      toggleTheme: () =>
        persist('sf-theme', theme === 'dark' ? 'light' : 'dark', setThemeState),
      palette,
      setPalette: (v) => persist('sf-palette', v, setPaletteState),
    }),
    [cur, theme, palette],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
