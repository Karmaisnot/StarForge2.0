import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, PageHeader } from '../components/primitives.jsx';
import { DataTable } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';

const ROLES = [
  { id: 'director', nameKey: 'roleDirector', who: 4, accent: 'var(--sf-primary)', sys: true },
  { id: 'manager', nameKey: 'roleManager', who: 4, accent: 'var(--sf-primary)' },
  { id: 'methodist', nameKey: 'roleMethodist', who: 6, accent: 'var(--sf-accent)' },
  { id: 'teacher', nameKey: 'roleTeacher', who: 38, accent: 'var(--sf-success)' },
  { id: 'assistant', nameKey: 'roleAssistant', who: 12, accent: 'var(--sf-success)' },
  { id: 'reception', nameKey: 'roleReception', who: 8, accent: 'var(--sf-ink-2)' },
  { id: 'sales', nameKey: 'roleSales', who: 5, accent: 'var(--sf-warn)' },
  { id: 'accountant', nameKey: 'roleAccountant', who: 3, accent: 'var(--sf-success)' },
  { id: 'auditor', nameKey: 'roleAuditor', who: 2, accent: '#7A4A82' },
];

const MODULES = [
  { key: 'modStudents', perms: { director: 'full', manager: 'full', methodist: 'edit', teacher: 'view', assistant: 'view', reception: 'edit', sales: 'view', accountant: 'view', auditor: 'view' } },
  { key: 'modGroups', perms: { director: 'full', manager: 'full', methodist: 'edit', teacher: 'edit', assistant: 'view', reception: 'view', sales: 'none', accountant: 'none', auditor: 'view' } },
  { key: 'modHr', perms: { director: 'full', manager: 'edit', methodist: 'view', teacher: 'none', assistant: 'none', reception: 'none', sales: 'none', accountant: 'view', auditor: 'view' } },
  { key: 'modPayments', perms: { director: 'full', manager: 'full', methodist: 'none', teacher: 'none', assistant: 'none', reception: 'edit', sales: 'view', accountant: 'full', auditor: 'view' } },
  { key: 'modPayroll', perms: { director: 'full', manager: 'edit', methodist: 'none', teacher: 'none', assistant: 'none', reception: 'none', sales: 'none', accountant: 'full', auditor: 'view' } },
  { key: 'modCards', perms: { director: 'full', manager: 'full', methodist: 'edit', teacher: 'edit', assistant: 'edit', reception: 'none', sales: 'none', accountant: 'none', auditor: 'view' } },
  { key: 'modMessages', perms: { director: 'full', manager: 'full', methodist: 'edit', teacher: 'edit', assistant: 'edit', reception: 'edit', sales: 'edit', accountant: 'view', auditor: 'view' } },
  { key: 'modReports', perms: { director: 'full', manager: 'edit', methodist: 'view', teacher: 'view', assistant: 'none', reception: 'view', sales: 'edit', accountant: 'edit', auditor: 'full' } },
  { key: 'modBranches', perms: { director: 'full', manager: 'view', methodist: 'none', teacher: 'none', assistant: 'none', reception: 'none', sales: 'none', accountant: 'view', auditor: 'view' } },
  { key: 'modSettings', perms: { director: 'full', manager: 'edit', methodist: 'none', teacher: 'none', assistant: 'none', reception: 'none', sales: 'none', accountant: 'none', auditor: 'view' } },
  { key: 'modAudit', perms: { director: 'view', manager: 'none', methodist: 'none', teacher: 'none', assistant: 'none', reception: 'none', sales: 'none', accountant: 'none', auditor: 'full' } },
];

export function PermissionsPage() {
  const { t } = useTranslation();
  const a = useActions();
  const [sel, setSel] = useState('methodist');

  const lvl = {
    none: [t('permissions.lvlNone'), 'var(--sf-muted-2)', 'var(--sf-surface-2)'],
    view: [t('permissions.lvlView'), 'var(--sf-primary)', 'var(--sf-primary-soft)'],
    edit: [t('permissions.lvlEdit'), 'var(--sf-accent-ink)', 'var(--sf-accent-soft)'],
    full: [t('permissions.lvlFull'), 'var(--sf-success)', 'var(--sf-success-soft)'],
  };
  const cur = ROLES.find((r) => r.id === sel);
  const accessCount = MODULES.filter((m) => m.perms[sel] !== 'none').length;

  return (
    <>
      <PageHeader
        eyebrow={t('permissions.eyebrow')}
        title={t('permissions.title')}
        sub={t('permissions.sub')}
        right={
          <>
            <Button kind="soft" onClick={a.soon}>{cloneElement(Icons.doc, { size: 14 })} {t('permissions.template')}</Button>
            <Button kind="primary" onClick={a.create}>{cloneElement(Icons.plus, { size: 14 })} {t('permissions.newRole')}</Button>
          </>
        }
      />
      <div className="og-perm-layout">
        <Card pad={false} className="og-roles">
          <div className="og-roles-h">{t('permissions.rolesTitle')}</div>
          {ROLES.map((r) => (
            <button key={r.id} className={'og-role' + (sel === r.id ? ' on' : '')} onClick={() => setSel(r.id)}>
              <span className="og-role-dot" style={{ background: r.accent }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="og-role-n">{t('permissions.' + r.nameKey)}{r.sys && <span className="og-role-sys">{t('permissions.system')}</span>}</div>
                <div className="og-role-w">{r.who} {t('permissions.staffCount')}</div>
              </div>
              {cloneElement(Icons.chevR, { size: 14, style: { color: 'var(--sf-muted)' } })}
            </button>
          ))}
        </Card>
        <div className="og-perm-main">
          <Card pad={false}>
            <div className="og-perm-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div className="og-perm-mark" style={{ background: cur.accent }}>{cloneElement(Icons.shield, { size: 18, style: { color: '#fff' } })}</div>
                <div>
                  <div className="og-perm-n">{t('permissions.' + cur.nameKey)}</div>
                  <div className="og-perm-s">{cur.who} {t('permissions.staffCount')} · {accessCount} {t('permissions.moduleAccess')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button kind="ghost" onClick={a.soon}>{t('common.copy')}</Button>
                <Button kind="primary" onClick={a.save}>{cloneElement(Icons.check, { size: 13 })} {t('common.save')}</Button>
              </div>
            </div>
            <div className="og-legend">
              {Object.entries(lvl).map(([k, v]) => (
                <span key={k} className="og-legend-i"><span className="og-legend-sw" style={{ background: v[2], borderColor: v[1] }} />{v[0]}</span>
              ))}
            </div>
            <DataTable cols={[
              { label: t('cols.module') }, { label: t('cols.view'), align: 'center' }, { label: t('cols.editPerm'), align: 'center' },
              { label: t('cols.create'), align: 'center' }, { label: t('cols.remove'), align: 'center' }, { label: t('cols.level'), align: 'center' },
            ]}>
              {MODULES.map((mod, i) => {
                const p = mod.perms[sel];
                const has = { view: p !== 'none', edit: p === 'edit' || p === 'full', create: p === 'full', del: p === 'full' };
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, fontSize: 12.5 }}>{t('permissions.' + mod.key)}</td>
                    {['view', 'edit', 'create', 'del'].map((act) => (
                      <td key={act} align="center"><span className={'og-cell' + (has[act] ? ' on' : '')} style={has[act] ? { background: lvl[p][1] } : {}}>{has[act] && cloneElement(Icons.check, { size: 12, stroke: 3, style: { color: '#fff' } })}</span></td>
                    ))}
                    <td align="center"><span className="og-lvl" style={{ background: lvl[p][2], color: lvl[p][1] }}>{lvl[p][0]}</span></td>
                  </tr>
                );
              })}
            </DataTable>
          </Card>
        </div>
      </div>
    </>
  );
}
