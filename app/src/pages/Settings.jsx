import { cloneElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { ROLE_CFG } from '../config/roles.js';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { LANGUAGES } from '../i18n/index.js';
import { CURRENCIES } from '../lib/format.js';
import { useActions } from '../hooks/useActions.jsx';
import { ApiConnectionCard } from '../components/ApiConnectionCard.jsx';

export function SettingsPage({ role }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, cur, setCur } = usePreferences();
  const { reset } = useStore();
  const a = useActions();
  const cfg = ROLE_CFG[role];

  const [density, setDensity] = useState(() => {
    try { return localStorage.getItem('sf-density') || 'dense'; } catch { return 'dense'; }
  });
  useEffect(() => {
    document.documentElement.dataset.density = density;
    try { localStorage.setItem('sf-density', density); } catch { /* ignore */ }
  }, [density]);

  // Informational rows open a read-only detail card instead of a dead chevron.
  const info = (label, value) => a.open(label, { title: label, sub: t('settings.rowNote'), rows: [[label, value]] });

  const cycle = (list, value, set) => () => set(list[(list.indexOf(value) + 1) % list.length]);
  const resetDemo = () => {
    reset();
    window.location.reload();
  };

  const sections = [
    {
      h: t('settings.secRole'),
      rows: [
        [t('settings.rowRole'), t(cfg.labelKey)],
        [t('settings.rowScope'), t(cfg.scopeKey)],
        [t('settings.rowExport'), t('settings.valFull')],
        [t('settings.rowReadChats'), t('settings.valYes')],
      ],
    },
    {
      h: t('settings.secAppearance'),
      rows: [
        [t('settings.rowTheme'), theme === 'dark' ? t('shell.dark') : t('shell.light'), toggleTheme],
        [t('settings.rowLanguage'), t('lang.' + i18n.resolvedLanguage), cycle(LANGUAGES, i18n.resolvedLanguage, i18n.changeLanguage)],
        [t('settings.rowCurrency'), `${cur} · ${t('settings.currencySwitches')}`, cycle(CURRENCIES, cur, setCur)],
        [t('settings.rowDensity'), density === 'dense' ? t('settings.valDense') : t('settings.valComfortable'), () => setDensity((d) => (d === 'dense' ? 'comfortable' : 'dense'))],
      ],
    },
    {
      h: t('settings.secNotifications'),
      rows: [
        [t('settings.rowEmail'), t('settings.valDaily')],
        [t('settings.rowCritical'), t('settings.valImmediate')],
        [t('settings.rowWeekly'), t('settings.valMonday')],
      ],
    },
    {
      h: t('settings.secSecurity'),
      rows: [
        [t('settings.row2fa'), t('settings.val2fa')],
        [t('settings.rowSession'), t('settings.val8h')],
        [t('settings.rowLog'), t('settings.valSaved')],
      ],
    },
    {
      h: t('settings.secData'),
      rows: [[t('settings.rowReset'), t('settings.resetHint'), resetDemo]],
    },
  ];

  return (
    <>
      <PageHeader title={t('settings.title')} sub={`${t(cfg.labelKey)} ${t('settings.console')} · ${cfg.who}`} />
      <div className="ad-set-grid">
        <Card title={t('settings.profile')} pad={false}>
          <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <SfAvatar name={cfg.who} size={56} color={cfg.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{cfg.who}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sf-muted)' }}>{t(cfg.whoRoleKey)} · {t(cfg.scopeKey)}</div>
            </div>
            <Button kind="soft" onClick={a.save}>{t('common.edit')}</Button>
          </div>
        </Card>
        <ApiConnectionCard />
        {sections.map((sec, i) => (
          <Card key={i} title={sec.h} pad={false}>
            {sec.rows.map((r, j) => {
              const handler = typeof r[2] === 'function' ? r[2] : () => info(r[0], r[1]);
              return (
                <div
                  key={j}
                  className="ad-set-row"
                  style={{ borderBottom: j < sec.rows.length - 1 ? '1px solid var(--sf-border)' : 'none', cursor: 'pointer' }}
                  onClick={handler}
                >
                  <span style={{ fontSize: 13 }}>{r[0]}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--sf-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {r[1]} {cloneElement(Icons.chevR, { size: 13 })}
                  </span>
                </div>
              );
            })}
          </Card>
        ))}
      </div>
    </>
  );
}
