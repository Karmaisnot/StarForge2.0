import { cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { SfStar, SfAvatar } from '../components/primitives.jsx';
import { groupNav } from '../config/roles.js';
import { fmtCount } from '../lib/format.js';
import { usePopover } from '../hooks/useOutsideClick.js';

function branchLabel(b, t) {
  if (b.id === 'all') return t('shell.allBranches');
  return b.name;
}
function branchSub(b, t) {
  if (b.id === 'all') return `${b.branches} ${t('shell.branchesWord')} · ${b.students} ${t('shell.studentsWord')}`;
  return `${b.students} ${t('shell.studentsWord')}`;
}

export function Sidebar({ cfg, active, onNav, branches, branch, onBranch, open, onClose }) {
  const { t } = useTranslation();
  const pop = usePopover(false);
  const groups = groupNav(cfg.nav);
  const curBranch = branches.find((b) => b.id === branch) || branches[0];
  const options = cfg.role === 'manager' ? branches.slice(1, 2) : branches;

  return (
    <aside className={'ad-side' + (open ? ' open' : '')}>
      <div className="ad-side-top">
        <div className="ad-brand">
          <SfStar size={26} color={cfg.accent} />
          <div className="ad-brand-tx">
            <div className="ad-brand-n">
              StarForge<span style={{ color: 'var(--sf-muted)', fontWeight: 500 }}> · EDU</span>
            </div>
            <div className="ad-brand-role" style={{ color: cfg.accent }}>
              {t(cfg.consoleKey)}
            </div>
          </div>
        </div>
        <button className="ad-side-x" onClick={onClose} aria-label="Close menu">
          {cloneElement(Icons.x, { size: 18 })}
        </button>
      </div>

      <div className="ad-branch" ref={pop.ref} onClick={pop.toggle}>
        <div className="ad-branch-mark" style={{ background: cfg.accent }}>
          {cloneElement(Icons.globe, { size: 15, style: { color: '#FFFCF5' } })}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ad-branch-n">{branchLabel(curBranch, t)}</div>
          <div className="ad-branch-sub">{branchSub(curBranch, t)}</div>
        </div>
        {cloneElement(Icons.chevD, { size: 14, style: { color: 'var(--sf-muted)' } })}
        {pop.open && (
          <div className="ad-branch-menu" onClick={(e) => e.stopPropagation()}>
            {options.map((b) => (
              <div
                key={b.id}
                className={'ad-branch-opt' + (b.id === branch ? ' on' : '')}
                onClick={() => {
                  onBranch(b.id);
                  pop.setOpen(false);
                }}
              >
                <div>
                  <div className="ad-branch-opt-n">{branchLabel(b, t)}</div>
                  <div className="ad-branch-opt-s">{branchSub(b, t)}</div>
                </div>
                {b.id === branch && cloneElement(Icons.check, { size: 14, style: { color: cfg.accent } })}
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="ad-nav">
        {groups.map((g) => (
          <div key={g.grpKey} className="ad-nav-grp">
            <div className="ad-nav-grp-l">{t('navGroups.' + g.grpKey)}</div>
            {g.items.map((item) => {
              const on = active === item.id;
              return (
                <button
                  key={item.id}
                  className={'ad-nav-i' + (on ? ' on' : '')}
                  onClick={() => onNav(item.id)}
                  style={on ? { '--on-accent': item.accent || cfg.accent } : undefined}
                >
                  <span
                    className="ad-nav-ic"
                    style={{ color: on ? '#FFFCF5' : item.accent || 'var(--sf-muted)' }}
                  >
                    {cloneElement(item.icon, { size: 17 })}
                  </span>
                  <span className="ad-nav-l">{t(item.labelKey)}</span>
                  {item.n != null && (
                    <span
                      className={'ad-nav-n' + (item.accent ? ' acc' : '')}
                      style={item.accent ? { background: item.accent } : undefined}
                    >
                      {fmtCount(item.n)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <button className="ad-side-user" onClick={() => onNav('settings')}>
        <SfAvatar name={cfg.who} size={36} color={cfg.accent} />
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div className="ad-user-n">{cfg.who}</div>
          <div className="ad-user-r">{t(cfg.whoRoleKey)}</div>
        </div>
        {cloneElement(Icons.logout, { size: 15, style: { color: 'var(--sf-muted)' } })}
      </button>
    </aside>
  );
}
