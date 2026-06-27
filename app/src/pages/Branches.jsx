import { cloneElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfStar, SfAvatar } from '../components/primitives.jsx';
import { Kpi, BarChart, Legend } from '../components/charts.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { branchMetrics } from '../lib/metrics.js';
import { fmtMoney } from '../lib/format.js';

export function BranchesPage() {
  const { t } = useTranslation();
  const a = useActions();
  const { items: branches, add, update } = useCollection('branches');
  const m = useMemo(() => branchMetrics(branches), [branches]);
  const realBranches = useMemo(() => branches.filter((b) => b.status !== 'opening'), [branches]);
  const statusPill = {
    active: ['success', t('status.active')],
    review: ['warn', t('status.reviewState')],
    opening: ['primary', t('status.opening')],
    paused: ['neutral', t('status.paused')],
  };

  const openBranch = () =>
    a.create({
      title: t('branches.openNew'),
      submitLabel: t('branches.openNew'),
      fields: [
        { name: 'name', label: t('nav.branches'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'mgr', label: t('branches.assignManager') },
      ],
      onSubmit: (v) =>
        add({
          n: v.name,
          mgr: v.mgr || '—',
          st: 0,
          t: 0,
          rev: 0,
          att: 0,
          churn: 0,
          tone: 'var(--sf-muted)',
          status: 'opening',
        }),
    });

  // Assign / change a branch manager. For a branch that is still opening, naming
  // a manager is the milestone that brings it online.
  const assignManager = (b) =>
    a.save({
      title: t('branches.assignManager'),
      fields: [{ name: 'mgr', label: t('branches.assignManager'), required: true, value: b.mgr === '—' ? '' : b.mgr, placeholder: t('ui.fNamePh') }],
      onSubmit: (v) => update(b.n, { mgr: v.mgr, status: b.status === 'opening' ? 'active' : b.status }),
    });

  // Edit a branch in place (name + manager).
  const configureBranch = (b) =>
    a.save({
      title: t('branches.actConfig'),
      fields: [
        { name: 'name', label: t('nav.branches'), required: true, value: b.n },
        { name: 'mgr', label: t('branches.assignManager'), value: b.mgr === '—' ? '' : b.mgr },
      ],
      onSubmit: (v) => update(b.n, { n: v.name || b.n, mgr: v.mgr || b.mgr }),
    });

  // Per-branch performance report — confirms, then downloads a real .html report.
  const branchReport = (b) =>
    a.report({
      title: b.n,
      subtitle: t('branches.actReport'),
      sections: [
        {
          heading: b.n,
          rows: [
            [t('branches.studentsShort'), String(b.st)],
            [t('branches.staffShort'), String(b.t)],
            [t('branches.revenuePerMonth'), fmtMoney(b.rev, 'UZS')],
            [t('cols.attendance'), b.att + '%'],
            [t('branches.churnShort'), b.churn + '%'],
          ],
        },
      ],
    });

  // Top-of-page export of the full branch list.
  const exportBranches = () =>
    a.exportData({
      name: t('nav.branches'),
      columns: [
        { key: 'n', label: t('nav.branches') },
        { key: 'mgr', label: t('branches.assignManager') },
        { key: 'st', label: t('branches.studentsShort') },
        { key: 't', label: t('branches.staffShort') },
        { key: 'rev', label: t('branches.revenuePerMonth') },
        { key: 'att', label: t('cols.attendance') },
      ],
      rows: branches,
      allRows: branches,
    });

  // Pause ⇄ resume a branch — confirms, then flips its status for real.
  const togglePause = (b) => {
    const paused = b.status === 'paused';
    a.confirm({
      icon: Icons.clock,
      tone: paused ? 'success' : 'warn',
      toastTone: paused ? 'success' : 'warn',
      title: paused ? t('branches.actResume') : t('branches.actPause'),
      message: paused ? b.n : t('branches.pauseConfirm'),
      confirmLabel: paused ? t('branches.actResume') : t('branches.actPause'),
      desc: b.n,
      onConfirm: () => update(b.n, { status: paused ? 'active' : 'paused' }),
    });
  };

  return (
    <>
      <PageHeader
        eyebrow={t('branches.eyebrow')}
        title={t('nav.branches')}
        sub={t('branches.sub')}
        right={
          <>
            <Button kind="soft" onClick={exportBranches}>{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={openBranch}>{cloneElement(Icons.plus, { size: 14 })} {t('branches.openNew')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('branches.kpiActive')} value={String(m.active)} accent="var(--sf-success)" icon={Icons.globe} />
        <Kpi label={t('branches.kpiOpening')} value={String(m.opening.length)} accent="var(--sf-primary)" sub={m.opening.map((b) => b.n).join(', ') || '—'} />
        <Kpi label={t('branches.kpiRevenue')} money={m.revenue} accent="var(--sf-success)" trend={{ up: true, v: '8.2%' }} />
        <Kpi label={t('branches.kpiReview')} value={String(m.review.length)} accent="var(--sf-warn)" sub={m.review.map((b) => b.n).join(', ') || '—'} />
      </div>
      <div className="ad-branch-cards">
        {branches.map((b, i) => (
          <Card key={b.n} pad={false} className="ad-branch-card">
            <div className="ad-bc-head">
              <div className="ad-bc-rank">{b.status === 'opening' ? '—' : '#' + (i + 1)}</div>
              <div className="ad-bc-mark" style={{ background: b.tone }}><SfStar size={20} color="#FFFCF5" /></div>
              <div style={{ flex: 1 }}>
                <div className="ad-bc-n">{b.n}</div>
                <div className="ad-bc-mgr"><SfAvatar name={b.mgr} size={16} /> {b.mgr}</div>
              </div>
              <Pill tone={statusPill[b.status][0]} dot>{statusPill[b.status][1]}</Pill>
            </div>
            {b.status === 'opening' ? (
              <div className="ad-bc-opening">
                <div className="ad-bc-open-bar"><div style={{ width: '65%' }} /></div>
                <div className="ad-bc-open-t">{t('branches.openingProgress')}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="ad-btn ad-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => assignManager(b)}>{t('branches.assignManager')}</button>
                  <button className="ad-btn ad-btn-ghost" onClick={() => configureBranch(b)}>{t('branches.configure')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="ad-bc-stats">
                  <div><Money uzs={b.rev} className="ad-bc-v" /><span className="ad-bc-l">{t('branches.revenuePerMonth')}</span></div>
                  <div><span className="ad-bc-v sf-mono">{b.st}</span><span className="ad-bc-l">{t('branches.studentsShort')}</span></div>
                  <div><span className="ad-bc-v sf-mono">{b.t}</span><span className="ad-bc-l">{t('branches.staffShort')}</span></div>
                  <div><span className="ad-bc-v sf-mono" style={{ color: b.att >= 92 ? 'var(--sf-success)' : 'var(--sf-warn)' }}>{b.att}%</span><span className="ad-bc-l">{t('cols.attendance')}</span></div>
                  <div><span className="ad-bc-v sf-mono" style={{ color: b.churn <= 3.5 ? 'var(--sf-success)' : 'var(--sf-danger)' }}>{b.churn}%</span><span className="ad-bc-l">{t('branches.churnShort')}</span></div>
                </div>
                <div className="ad-bc-actions">
                  <button className="ad-bc-act" onClick={() => branchReport(b)}>{cloneElement(Icons.trend, { size: 13 })} {t('branches.actReport')}</button>
                  <button className="ad-bc-act" onClick={() => configureBranch(b)}>{cloneElement(Icons.settings, { size: 13 })} {t('branches.actConfig')}</button>
                  <button className="ad-bc-act" style={{ color: b.status === 'paused' ? 'var(--sf-success)' : 'var(--sf-warn)' }} onClick={() => togglePause(b)}>{cloneElement(Icons.clock, { size: 13 })} {b.status === 'paused' ? t('branches.actResume') : t('branches.actPause')}</button>
                </div>
              </>
            )}
          </Card>
        ))}
        <button className="ad-bc-new" onClick={openBranch}>
          <div className="ad-bc-new-ic">{cloneElement(Icons.plus, { size: 24 })}</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{t('branches.newCardTitle')}</div>
          <div style={{ fontSize: 11, color: 'var(--sf-muted)', textAlign: 'center', maxWidth: 200 }}>{t('branches.newCardSub')}</div>
        </button>
      </div>
      <Card title={t('branches.comparison')} style={{ marginTop: 14 }}>
        <BarChart labels={realBranches.map((b) => b.n)} series={[realBranches.map((b) => b.st), realBranches.map((b) => Math.round(b.rev / 1e6))]} colors={['var(--sf-primary)', 'var(--sf-accent)']} />
        <div className="ad-chart-legend">
          <Legend c="var(--sf-primary)" l={t('branches.legendStudents')} v="" />
          <Legend c="var(--sf-accent)" l={t('branches.legendRevenue')} v="" />
        </div>
      </Card>
    </>
  );
}
