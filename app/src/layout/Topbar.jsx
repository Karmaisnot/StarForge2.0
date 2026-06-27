import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { SfAvatar } from '../components/primitives.jsx';
import { PreferencesMenu } from './PreferencesMenu.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CURRENCIES, SF_SYM } from '../lib/format.js';
import { usePopover } from '../hooks/useOutsideClick.js';
import { useStore } from '../context/StoreContext.jsx';

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

// Cross-entity index built once. Each searchable record knows which page it
// lives on so a hit can route there.
function entry(page, labelKey, name, sub) {
  return { page, labelKey, name, sub, q: `${name} ${sub || ''}`.toLowerCase() };
}
function buildIndex(collections) {
  const list = (name) => collections[name] || [];
  return [
    ...list('students').map((r) => entry('students', 'nav.students', r.n, r.g)),
    ...list('teachers').map((r) => entry('teachers', 'nav.teachers', r.n, r.sub)),
    ...list('parents').map((r) => entry('parents', 'nav.parents', r.n, r.ch)),
    ...list('groups').map((r) => entry('groups', 'nav.groups', r.n, r.t)),
    ...list('leads').map((r) => entry('leads', 'nav.leads', r.n, r.int)),
  ];
}

function GlobalSearch({ cfg, onNav }) {
  const { t } = useTranslation();
  const pop = usePopover(false);
  const [query, setQuery] = useState('');
  const { collections } = useStore();
  const allowed = useMemo(() => new Set(cfg.nav.map((n) => n.id)), [cfg]);
  const index = useMemo(() => buildIndex(collections), [collections]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((r) => allowed.has(r.page) && r.q.includes(q)).slice(0, 8);
  }, [query, index, allowed]);

  const go = (r) => {
    onNav(r.page);
    setQuery('');
    pop.setOpen(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (results[0]) go(results[0]);
  };

  return (
    <div className="ad-pop ad-top-search-wrap" ref={pop.ref} style={{ flex: 1, minWidth: 0 }}>
      <form className="ad-search ad-top-search" onSubmit={submit}>
        {cloneElement(Icons.search, { size: 15, style: { color: 'var(--sf-muted)' } })}
        <input
          placeholder={t('common.searchAll')}
          value={query}
          onChange={(e) => { setQuery(e.target.value); pop.setOpen(true); }}
          onFocus={() => pop.setOpen(true)}
        />
        <span className="ad-kbd">⌘K</span>
      </form>
      {pop.open && query.trim() && (
        <div className="ad-search-menu" onClick={(e) => e.stopPropagation()}>
          {results.length === 0 ? (
            <div className="ad-search-empty">{t('common.noResults')}</div>
          ) : (
            results.map((r, i) => (
              <button key={i} className="ad-search-res" onClick={() => go(r)}>
                <SfAvatar name={r.name} size={26} />
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div className="ad-search-res-n">{r.name}</div>
                  <div className="ad-search-res-s">{r.sub}</div>
                </div>
                <span className="ad-search-res-tag">{t(r.labelKey)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function Topbar({ cfg, current, onNav, onOpenDrawer }) {
  const { t } = useTranslation();

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
      <GlobalSearch cfg={cfg} onNav={onNav} />
      <CurrencyMenu />
      <PreferencesMenu />
      <button className="ad-top-ic" onClick={() => onNav('messages')} aria-label={t('nav.messages')}>
        {cloneElement(Icons.bell, { size: 18 })}
        <span className="ad-top-dot" />
      </button>
      <button className="ad-top-av" onClick={() => onNav('settings')} aria-label={t('nav.settings')}>
        <SfAvatar name={cfg.who} size={32} color={cfg.accent} />
      </button>
    </header>
  );
}
