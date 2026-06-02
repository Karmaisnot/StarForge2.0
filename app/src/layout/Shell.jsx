import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { BRANCHES } from '../config/roles.js';
import { useToast } from '../context/ToastContext.jsx';

export function Shell({ cfg, active, onNav, children }) {
  const { t } = useTranslation();
  const { push } = useToast();
  const [drawer, setDrawer] = useState(false);
  const [branch, setBranch] = useState(cfg.defaultBranch);

  const navigate = (id) => {
    onNav(id);
    setDrawer(false);
  };

  const switchBranch = (id) => {
    setBranch(id);
    const b = BRANCHES.find((x) => x.id === id);
    push({
      tone: 'info',
      title: t('toast.switchedBranch'),
      desc: id === 'all' ? t('shell.allBranches') : b?.name,
    });
  };

  const current = cfg.nav.find((n) => n.id === active);

  return (
    <div className="ad-root" data-role={cfg.role}>
      <Sidebar
        cfg={cfg}
        active={active}
        onNav={navigate}
        branches={BRANCHES}
        branch={branch}
        onBranch={switchBranch}
        open={drawer}
        onClose={() => setDrawer(false)}
      />
      {drawer && <div className="ad-scrim" onClick={() => setDrawer(false)} />}
      <div className="ad-col">
        <Topbar cfg={cfg} current={current} onNav={navigate} onOpenDrawer={() => setDrawer(true)} />
        <main className="ad-main">{children}</main>
      </div>
    </div>
  );
}
