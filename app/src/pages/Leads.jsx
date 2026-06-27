import { cloneElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { leadMetrics } from '../lib/metrics.js';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { useScope } from '../context/ScopeContext.jsx';

// Pipeline stages, in board order. The card list for each column is derived
// from the single flat `leads` collection by its `stage` field.
const STAGES = [
  { id: 'new', labelKey: 'leads.colNew', c: 'var(--sf-primary)' },
  { id: 'contact', labelKey: 'leads.colContact', c: 'var(--sf-accent)' },
  { id: 'trial', labelKey: 'leads.colTrial', c: 'var(--sf-warn)' },
  { id: 'won', labelKey: 'leads.colWon', c: 'var(--sf-success)' },
];

export function LeadsPage() {
  const { t } = useTranslation();
  const a = useActions();
  const { scopeBranch } = useScope();
  const { items: leads, add } = useCollection('leads');

  const base = useMemo(() => scopeBranch(leads), [leads, scopeBranch]);
  const m = useMemo(() => leadMetrics(base), [base]);
  const cols = STAGES.map((s) => ({ ...s, l: t(s.labelKey), leads: base.filter((x) => x.stage === s.id) }));

  const newLead = () =>
    a.create({
      title: t('leads.newLead'),
      submitLabel: t('leads.newLead'),
      fields: [
        { name: 'name', label: t('cols.student'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'interest', label: t('cols.subject'), placeholder: 'Matematika' },
        { name: 'source', label: t('cols.contact'), placeholder: 'Instagram' },
      ],
      onSubmit: (v) =>
        add({
          id: `lead-${Date.now()}`,
          n: v.name,
          int: v.interest || '—',
          src: v.source || '—',
          tm: t('common.today'),
          stage: 'new',
        }),
    });

  return (
    <>
      <PageHeader
        eyebrow={t('leads.eyebrow')}
        title={t('leads.title')}
        sub={t('leads.sub')}
        right={<Button kind="primary" onClick={newLead}>{cloneElement(Icons.plus, { size: 14 })} {t('leads.newLead')}</Button>}
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <Kpi label={t('leads.kpiActive')} value={String(m.active)} icon={Icons.flag} />
        <Kpi label={t('leads.kpiAdmitted')} value={String(m.won)} accent="var(--sf-success)" trend={{ up: true, v: '18%' }} />
        <Kpi label={t('leads.kpiConversion')} value={`${m.conversion}%`} accent="var(--sf-primary)" />
        <Kpi label={t('leads.kpiAvgTime')} value="4.2 kun" />
      </div>
      <div className="ad-kanban">
        {cols.map((col) => (
          <div key={col.id} className="ad-kcol">
            <div className="ad-kcol-h"><span className="ad-kdot" style={{ background: col.c }} /><span className="ad-kname">{col.l}</span><span className="ad-kcount">{col.leads.length}</span></div>
            <div className="ad-kcards">
              {col.leads.map((l) => (
                <div
                  key={l.id}
                  className="ad-lcard"
                  onClick={() =>
                    a.open(l.n, {
                      title: l.n,
                      sub: col.l,
                      icon: Icons.flag,
                      rows: [
                        [t('cols.source'), l.src],
                        [t('cols.subject'), l.int],
                        [t('cols.stage'), col.l],
                        [t('cols.date'), l.tm],
                      ],
                    })
                  }
                >
                  <div className="ad-lcard-rail" style={{ background: col.c }} />
                  <div style={{ flex: 1, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SfAvatar name={l.n} size={26} /><span style={{ fontSize: 13, fontWeight: 700 }}>{l.n}</span></div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}><Pill tone="primary">{l.int}</Pill><Pill>{l.src}</Pill></div>
                    <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--sf-muted)' }} className="sf-mono">{l.tm}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
