import { cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfStar, SfAvatar } from '../components/primitives.jsx';
import { Kpi, BarChart, Legend } from '../components/charts.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { BRANCHES } from '../data/seeds.js';

export function BranchesPage() {
  const { t } = useTranslation();
  const a = useActions();
  const { items: branches, add } = useCollection('branches', BRANCHES, 'n');
  const statusPill = {
    active: ['success', t('status.active')],
    review: ['warn', t('status.reviewState')],
    opening: ['primary', t('status.opening')],
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

  return (
    <>
      <PageHeader
        eyebrow={t('branches.eyebrow')}
        title={t('nav.branches')}
        sub={t('branches.sub')}
        right={
          <>
            <Button kind="soft" onClick={a.exportData}>{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={openBranch}>{cloneElement(Icons.plus, { size: 14 })} {t('branches.openNew')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('branches.kpiActive')} value="4" accent="var(--sf-success)" icon={Icons.globe} />
        <Kpi label={t('branches.kpiOpening')} value="1" accent="var(--sf-primary)" sub="Olmazor" />
        <Kpi label={t('branches.kpiRevenue')} money={1184000000} accent="var(--sf-success)" trend={{ up: true, v: '8.2%' }} />
        <Kpi label={t('branches.kpiReview')} value="1" accent="var(--sf-warn)" sub="Sebzor" />
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
                  <button className="ad-btn ad-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={a.create}>{t('branches.assignManager')}</button>
                  <button className="ad-btn ad-btn-ghost" onClick={a.soon}>{t('branches.configure')}</button>
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
                  <button className="ad-bc-act" onClick={a.report}>{cloneElement(Icons.trend, { size: 13 })} {t('branches.actReport')}</button>
                  <button className="ad-bc-act" onClick={a.soon}>{cloneElement(Icons.settings, { size: 13 })} {t('branches.actConfig')}</button>
                  <button className="ad-bc-act" style={{ color: 'var(--sf-warn)' }} onClick={a.soon}>{cloneElement(Icons.clock, { size: 13 })} {t('branches.actPause')}</button>
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
        <BarChart labels={['Yunus.', 'Chilon.', 'Mirobod', 'Sebzor']} series={[[512, 486, 478, 366], [342, 318, 308, 216]]} colors={['var(--sf-primary)', 'var(--sf-accent)']} />
        <div className="ad-chart-legend">
          <Legend c="var(--sf-primary)" l={t('branches.legendStudents')} v="" />
          <Legend c="var(--sf-accent)" l={t('branches.legendRevenue')} v="" />
        </div>
      </Card>
    </>
  );
}
