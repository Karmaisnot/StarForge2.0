import { cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { usePreferences, PALETTES } from '../context/PreferencesContext.jsx';
import { LANGUAGES } from '../i18n/index.js';
import { usePopover } from '../hooks/useOutsideClick.js';

// Palette preview swatches — three representative tokens per palette.
const PALETTE_DOTS = {
  saroy: ['#B85535', '#D89A2E', '#4F7B3B'],
  marvarid: ['#2A6F9F', '#3F6E5C', '#7A4A82'],
  samarqand: ['#4F7B3B', '#A55A24', '#2A6F9F'],
  daryo: ['#7A4A82', '#2A6F9F', '#B85535'],
};

export function PreferencesMenu() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, palette, setPalette } = usePreferences();
  const pop = usePopover(false);
  const dark = theme === 'dark';

  return (
    <div className="ad-pop" ref={pop.ref}>
      <button className="ad-top-ic ad-pop-trigger" onClick={pop.toggle} aria-label={t('shell.preferences')}>
        {cloneElement(dark ? Icons.moon : Icons.sun, { size: 16 })}
      </button>
      {pop.open && (
        <div className="ad-cur-menu ad-prefs" onClick={(e) => e.stopPropagation()}>
          <div className="ad-prefs-h">{t('shell.theme')}</div>
          <div className="ad-prefs-row">
            <span>{dark ? t('shell.dark') : t('shell.light')}</span>
            <button className={'ad-toggle' + (dark ? ' on' : '')} onClick={toggleTheme} aria-label={t('shell.theme')} />
          </div>

          <div className="ad-prefs-h">{t('shell.palette')}</div>
          <div className="ad-pal-grid">
            {PALETTES.map((p) => (
              <button key={p} className={'ad-pal' + (palette === p ? ' on' : '')} onClick={() => setPalette(p)}>
                <span className="ad-pal-dots">
                  {PALETTE_DOTS[p].map((c, i) => (
                    <span key={i} className="ad-pal-dot" style={{ background: c }} />
                  ))}
                </span>
                {t('shell.pal' + p.charAt(0).toUpperCase() + p.slice(1))}
              </button>
            ))}
          </div>

          <div className="ad-prefs-h">{t('shell.language')}</div>
          {LANGUAGES.map((lng) => (
            <button key={lng} className={'ad-cur-opt' + (i18n.resolvedLanguage === lng ? ' on' : '')} onClick={() => i18n.changeLanguage(lng)}>
              <span style={{ flex: 1, fontWeight: 600 }}>{t('lang.' + lng)}</span>
              {i18n.resolvedLanguage === lng && cloneElement(Icons.check, { size: 13, style: { color: 'var(--sf-primary)' } })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
