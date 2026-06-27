import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, PageHeader } from '../components/primitives.jsx';
import { DataTable } from '../components/common.jsx';
import { useToast } from '../context/ToastContext.jsx';
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

const PERM_LEVELS = ['none', 'view', 'edit', 'full'];
const PERSIST_KEY = 'sf-permissions';
const loadSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(PERSIST_KEY) || 'null');
  } catch {
    return null;
  }
};

export function PermissionsPage() {
  const { t } = useTranslation();
  const a = useActions();
  const { push } = useToast();
  const saved = loadSaved();
  const [sel, setSel] = useState('methodist');
  const [roles, setRoles] = useState(() => saved?.roles || ROLES);
  const [edits, setEdits] = useState(() => saved?.edits || {}); // `${roleId}:${moduleKey}` -> level

  const lvl = {
    none: [t('permissions.lvlNone'), 'var(--sf-muted-2)', 'var(--sf-surface-2)'],
    view: [t('permissions.lvlView'), 'var(--sf-primary)', 'var(--sf-primary-soft)'],
    edit: [t('permissions.lvlEdit'), 'var(--sf-accent-ink)', 'var(--sf-accent-soft)'],
    full: [t('permissions.lvlFull'), 'var(--sf-success)', 'var(--sf-success-soft)'],
  };
  const cur = roles.find((r) => r.id === sel) || roles[0];
  const roleName = (r) => (r.name ? r.name : t('permissions.' + r.nameKey));

  // Effective level for a module under the selected role: a live edit wins,
  // else the seeded default, else no access (for freshly created roles).
  const permOf = (mod) => edits[`${sel}:${mod.key}`] ?? mod.perms[sel] ?? 'none';
  const accessCount = MODULES.filter((m) => permOf(m) !== 'none').length;

  // Click a level cell to cycle none → view → edit → full.
  const cyclePerm = (mod) => {
    const next = PERM_LEVELS[(PERM_LEVELS.indexOf(permOf(mod)) + 1) % PERM_LEVELS.length];
    setEdits((e) => ({ ...e, [`${sel}:${mod.key}`]: next }));
  };
  // Commit the in-memory role + permission edits to localStorage so they survive
  // a reload — the Save button now genuinely persists.
  const savePerms = () => {
    try {
      localStorage.setItem(PERSIST_KEY, JSON.stringify({ roles, edits }));
    } catch {
      /* storage unavailable — keep in-memory */
    }
    push({ tone: 'success', title: t('toast.saved'), desc: roleName(cur) });
  };

  // Clone the current role — permissions and all — into a new editable role.
  const copyRole = () => {
    const id = `role-${Date.now()}`;
    const clone = {};
    MODULES.forEach((m) => { clone[`${id}:${m.key}`] = permOf(m); });
    setEdits((e) => ({ ...e, ...clone }));
    setRoles((r) => [...r, { id, name: `${roleName(cur)} ${t('common.copy')}`, who: 0, accent: cur.accent }]);
    setSel(id);
    push({ tone: 'success', title: t('toast.created'), desc: `${roleName(cur)} ${t('common.copy')}` });
  };

  const newRole = () =>
    a.create({
      title: t('permissions.newRole'),
      submitLabel: t('permissions.newRole'),
      fields: [{ name: 'name', label: t('permissions.rolesTitle'), required: true, placeholder: t('ui.fNamePh') }],
      onSubmit: (v) => {
        const id = `role-${Date.now()}`;
        setRoles((r) => [...r, { id, name: v.name, who: 0, accent: 'var(--sf-primary)' }]);
        setSel(id);
      },
    });

  // New role pre-filled from an existing role's permissions.
  const fromTemplate = () =>
    a.create({
      title: t('permissions.template'),
      submitLabel: t('permissions.newRole'),
      fields: [
        { name: 'name', label: t('permissions.rolesTitle'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'base', label: t('permissions.template'), type: 'select', options: roles.map((r) => ({ value: r.id, label: roleName(r) })) },
      ],
      onSubmit: (v) => {
        const id = `role-${Date.now()}`;
        const base = v.base || roles[0].id;
        const clone = {};
        MODULES.forEach((m) => { clone[`${id}:${m.key}`] = edits[`${base}:${m.key}`] ?? m.perms[base] ?? 'none'; });
        setEdits((e) => ({ ...e, ...clone }));
        setRoles((r) => [...r, { id, name: v.name, who: 0, accent: 'var(--sf-accent)' }]);
        setSel(id);
      },
    });

  return (
    <>
      <PageHeader
        eyebrow={t('permissions.eyebrow')}
        title={t('permissions.title')}
        sub={t('permissions.sub')}
        right={
          <>
            <Button kind="soft" onClick={fromTemplate}>{cloneElement(Icons.doc, { size: 14 })} {t('permissions.template')}</Button>
            <Button kind="primary" onClick={newRole}>{cloneElement(Icons.plus, { size: 14 })} {t('permissions.newRole')}</Button>
          </>
        }
      />
      <div className="og-perm-layout">
        <Card pad={false} className="og-roles">
          <div className="og-roles-h">{t('permissions.rolesTitle')}</div>
          {roles.map((r) => (
            <button key={r.id} className={'og-role' + (sel === r.id ? ' on' : '')} onClick={() => setSel(r.id)}>
              <span className="og-role-dot" style={{ background: r.accent }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="og-role-n">{roleName(r)}{r.sys && <span className="og-role-sys">{t('permissions.system')}</span>}</div>
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
                  <div className="og-perm-n">{roleName(cur)}</div>
                  <div className="og-perm-s">{cur.who} {t('permissions.staffCount')} · {accessCount} {t('permissions.moduleAccess')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button kind="ghost" onClick={copyRole}>{t('common.copy')}</Button>
                <Button kind="primary" onClick={savePerms}>{cloneElement(Icons.check, { size: 13 })} {t('common.save')}</Button>
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
                const p = permOf(mod);
                const has = { view: p !== 'none', edit: p === 'edit' || p === 'full', create: p === 'full', del: p === 'full' };
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, fontSize: 12.5 }}>{t('permissions.' + mod.key)}</td>
                    {['view', 'edit', 'create', 'del'].map((act) => (
                      <td key={act} align="center"><span className={'og-cell' + (has[act] ? ' on' : '')} style={has[act] ? { background: lvl[p][1] } : {}}>{has[act] && cloneElement(Icons.check, { size: 12, stroke: 3, style: { color: '#fff' } })}</span></td>
                    ))}
                    <td align="center"><button className="og-lvl" style={{ background: lvl[p][2], color: lvl[p][1], border: 'none', cursor: 'pointer' }} onClick={() => cyclePerm(mod)}>{lvl[p][0]}</button></td>
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
