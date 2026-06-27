import { cloneElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { deptMetrics } from '../lib/metrics.js';

export function DepartmentsPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const { items: depts, add, update } = useCollection('departments');
  const m = useMemo(() => deptMetrics(depts), [depts]);

  // Read-only org structure across every department.
  const showStructure = () =>
    a.open(t('departments.structure'), {
      icon: Icons.cohort,
      title: t('departments.structure'),
      rows: depts.map((d) => [d.n, `${d.head} · ${d.cnt} ${t('departments.staffWord')}`]),
    });

  // One department's detail card.
  const showDept = (d) =>
    a.open(d.n, {
      icon: Icons.folder,
      title: d.n,
      sub: d.head,
      rows: [
        [t('departments.head'), d.head],
        [t('departments.kpiStaff'), String(d.cnt)],
        [t('departments.groupWord'), String(d.groups)],
        [t('cols.staffMember'), d.members.join(', ')],
      ],
    });

  // Add a member to this specific department (updates its roster + count).
  const addMember = (d) =>
    a.create({
      title: `${d.n} · ${t('departments.addMember')}`,
      submitLabel: t('common.add'),
      fields: [{ name: 'name', label: t('cols.staffMember'), required: true, placeholder: t('ui.fNamePh') }],
      onSubmit: (v) => update(d.n, { members: [...d.members, v.name], cnt: d.cnt + 1 }),
    });

  const addDept = () =>
    a.create({
      title: t('departments.newDept'),
      fields: [
        { name: 'name', label: t('cols.department'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'head', label: t('departments.head') },
      ],
      onSubmit: (v) =>
        add({
          n: v.name,
          head: v.head || '—',
          cnt: v.head ? 1 : 0,
          groups: 0,
          color: 'var(--sf-primary)',
          members: v.head ? [v.head] : [],
        }),
    });

  return (
    <>
      <PageHeader
        eyebrow={role === 'ceo' ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('nav.departments')}
        sub={t('departments.sub')}
        right={
          <>
            <Button kind="soft" onClick={showStructure}>{cloneElement(Icons.cohort, { size: 14 })} {t('departments.structure')}</Button>
            <Button kind="primary" onClick={addDept}>{cloneElement(Icons.plus, { size: 14 })} {t('departments.newDept')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('departments.kpiDepts')} value={String(m.total)} icon={Icons.folder} />
        <Kpi label={t('departments.kpiStaff')} value={String(m.staff)} accent="var(--sf-primary)" />
        <Kpi label={t('departments.kpiTeaching')} value={String(m.teaching)} sub={t('departments.teachingSub')} />
        <Kpi label={t('departments.kpiAdmin')} value={String(m.admin)} sub={t('departments.adminSub')} />
      </div>
      <div className="og-dept-grid">
        {depts.map((d) => (
          <Card key={d.n} pad={false} className="og-dept">
            <div className="og-dept-bar" style={{ background: d.color }} />
            <div className="og-dept-body">
              <div className="og-dept-head">
                <div className="og-dept-mark" style={{ background: d.color }}>{cloneElement(Icons.folder, { size: 18, style: { color: '#fff' } })}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="og-dept-n">{d.n}</div>
                  <div className="og-dept-meta">{d.cnt} {t('departments.staffWord')}{d.groups > 0 ? ` · ${d.groups} ${t('departments.groupWord')}` : ''}</div>
                </div>
                <button className="ad-mini-btn" style={{ color: 'var(--sf-muted)' }} onClick={() => showDept(d)}>{cloneElement(Icons.more, { size: 15 })}</button>
              </div>
              <div className="og-dept-head-row">
                <SfAvatar name={d.head} size={26} />
                <div><span className="og-dept-headlbl">{t('departments.head')}</span><div className="og-dept-headn">{d.head}</div></div>
              </div>
              <div className="og-dept-members">
                <div className="og-avatars">
                  {d.members.slice(0, 4).map((m, j) => <div key={j} className="og-av-wrap" style={{ zIndex: 4 - j }}><SfAvatar name={m} size={28} /></div>)}
                  {d.cnt > 4 && <div className="og-av-more">+{d.cnt - 4}</div>}
                </div>
                <button className="og-add-member" onClick={() => addMember(d)}>{cloneElement(Icons.plus, { size: 13 })} {t('departments.addMember')}</button>
              </div>
            </div>
          </Card>
        ))}
        <button className="og-dept-new" onClick={addDept}>
          <div className="og-dept-new-ic">{cloneElement(Icons.plus, { size: 22 })}</div>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t('departments.newCardTitle')}</div>
          <div style={{ fontSize: 11, color: 'var(--sf-muted)' }}>{t('departments.newCardSub')}</div>
        </button>
      </div>
    </>
  );
}
