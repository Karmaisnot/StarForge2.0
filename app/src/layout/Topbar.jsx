import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { SfAvatar } from '../components/primitives.jsx';
import { PreferencesMenu } from './PreferencesMenu.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CURRENCIES, SF_SYM } from '../lib/format.js';
import { usePopover } from '../hooks/useOutsideClick.js';

function CurrencyMenu() {
  const { t } = useTranslation();
  const { cur, setCur } = usePreferences();
  const { push } = useToast();
  const pop = usePopover(false);

  const select = (c) => {
    setCur(c);
    pop.setOpen(false);
    push({ tone: 'info', title: t('toast.switchedCurrency'), desc: c });
  };

  return (
    <div className="ad-pop" ref={pop.ref}>
      <button className="ad-pop-trigger" onClick={pop.toggle}>
        <span className="sf-mono">{cur}</span>
        {cloneElement(Icons.chevD, { size: 13 })}
      </button>
      {pop.open && (
        <div className="ad-cur-menu" onClick={(e) => e.stopPropagation()}>
          {CURRENCIES.map((c) => (
            <button key={c} className={'ad-cur-opt' + (c === cur ? ' on' : '')} onClick={() => select(c)}>
              <span className="sf-mono" style={{ fontWeight: 700 }}>{c}</span>
              <span className="ad-cur-sym">{SF_SYM[c]}</span>
              {c === cur && cloneElement(Icons.check, { size: 13, style: { color: 'var(--sf-primary)' } })}
            </button>
          ))}
          <div className="ad-cur-note">{t('shell.rateNote')}</div>
        </div>
      )}
    </div>
  );
}

export function Topbar({ cfg, current, onNav, onOpenDrawer }) {
  const { t } = useTranslation();
  const { push } = useToast();
  const [query, setQuery] = useState('');

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) push({ tone: 'info', title: t('toast.opened'), desc: query.trim() });
  };

  return (
    <header className="ad-top">
      <button className="ad-burger" onClick={onOpenDrawer} aria-label="Open menu">
        {cloneElement(Icons.filter, { size: 20 })}
      </button>
      <div className="ad-crumb">
        <span className="ad-crumb-scope" style={{ color: cfg.accent }}>{t(cfg.labelKey)}</span>
        {cloneElement(Icons.chevR, { size: 12, style: { color: 'var(--sf-muted)' } })}
        <span className="ad-crumb-cur">{current ? t(current.labelKey) : ''}</span>
      </div>
      <form className="ad-search ad-top-search" onSubmit={submitSearch}>
        {cloneElement(Icons.search, { size: 15, style: { color: 'var(--sf-muted)' } })}
        <input placeholder={t('common.searchAll')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="ad-kbd">⌘K</span>
      </form>
      <CurrencyMenu />
      <PreferencesMenu />
      <button className="ad-top-ic" onClick={() => push({ tone: 'info', title: t('toast.opened'), desc: t('nav.messages') })} aria-label={t('nav.messages')}>
        {cloneElement(Icons.bell, { size: 18 })}
        <span className="ad-top-dot" />
      </button>
      <button className="ad-top-av" onClick={() => onNav('settings')} aria-label={t('nav.settings')}>
        <SfAvatar name={cfg.who} size={32} color={cfg.accent} />
      </button>
    </header>
  );
}
