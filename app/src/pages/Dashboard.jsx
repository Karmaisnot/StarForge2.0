import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, Bar, PageHeader, SfAvatar, SfAiBadge } from '../components/primitives.jsx';
import { Kpi, AreaChart, HBars, Donut, Legend } from '../components/charts.jsx';
import { DataTable, Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { GROUPS, BRANCHES, APPROVALS } from '../data/seeds.js';

const MONTHS = ['Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May'];
const REV_SERIES = [820, 860, 910, 890, 960, 1020, 1080, 1040, 1140, 1180, 1220, 1284].map((x) => x * 1e6);

const TEACHERS = [
  { n: 'Nigora Karimova', b: 'Yunusobod', g: 3, att: 94, up: 18, down: 4, r: 4.9 },
  { n: 'Aziz Tursunov', b: 'Chilonzor', g: 4, att: 92, up: 22, down: 2, r: 4.8 },
  { n: 'Malika Yusupova', b: 'Mirobod', g: 3, att: 88, up: 12, down: 6, r: 4.5 },
  { n: 'Bobur Aliyev', b: 'Yunusobod', g: 4, att: 90, up: 15, down: 3, r: 4.6 },
];

const EVENTS = [
  { t: 'Yangi to‘lov · 1.2 mln', who: 'Chilonzor', icon: Icons.trend, c: 'var(--sf-success)', tm: '2 daq' },
  { t: 'Qarz eslatmasi yuborildi', who: '12 oila', icon: Icons.bell, c: 'var(--sf-warn)', tm: '14 daq' },
  { t: 'Yangi o‘quvchi qabul', who: 'Yunusobod', icon: Icons.cohort, c: 'var(--sf-primary)', tm: '1 soat' },
  { t: 'Audit flagi · davomat', who: 'Mirobod', icon: Icons.flag, c: 'var(--sf-danger)', tm: '2 soat' },
];

export function DashboardPage({ role, onNav }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [range, setRange] = useState('12');
  const rev = ceo ? 1284000000 : 342000000;

  // Seed/read the same collections the full pages use, so creating here shows up
  // there too — and the approvals widget reflects (and mutates) real requests.
  const { add: addGroup } = useCollection('groups', GROUPS, 'n');
  const { add: addBranch } = useCollection('branches', BRANCHES, 'n');
  const { items: approvals, remove: removeApproval } = useCollection('approvals', APPROVALS, 'id');

  const createEntity = () =>
    ceo
      ? a.create({
          title: t('dash.newBranch'),
          submitLabel: t('dash.newBranch'),
          fields: [
            { name: 'name', label: t('nav.branches'), required: true, placeholder: t('ui.fNamePh') },
            { name: 'mgr', label: t('branches.assignManager') },
          ],
          onSubmit: (v) => addBranch({ n: v.name, mgr: v.mgr || '—', st: 0, t: 0, rev: 0, att: 0, churn: 0, tone: 'var(--sf-muted)', status: 'opening' }),
        })
      : a.create({
          title: t('dash.newGroup'),
          submitLabel: t('dash.newGroup'),
          fields: [
            { name: 'name', label: t('cols.group'), required: true, placeholder: 'Ingliz B2 · Intensiv' },
            { name: 'teacher', label: t('cols.teacher') },
          ],
          onSubmit: (v) => addGroup({ n: v.name, t: v.teacher || '—', b: 'Yunusobod', st: 0, cap: 20, att: 100, sch: '—', fee: 600000, tone: 'var(--sf-primary)' }),
        });

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('dash.eyebrowCeo') : t('dash.eyebrowManager')}
        title={ceo ? t('dash.titleCeo') : t('dash.titleManager')}
        sub={ceo ? t('dash.subCeo') : t('dash.subManager')}
        right={
          <>
            <Button kind="soft" onClick={a.report}>{cloneElement(Icons.download, { size: 14 })} {t('common.report')}</Button>
            <Button kind="primary" onClick={createEntity}>{cloneElement(Icons.plus, { size: 14 })} {ceo ? t('dash.newBranch') : t('dash.newGroup')}</Button>
          </>
        }
      />

      <div className="ad-kpi-grid">
        <Kpi label={t('dash.kpiRevenue')} money={rev} accent="var(--sf-success)" trend={{ up: true, v: '12.4%' }} spark={[60, 64, 62, 70, 68, 76, 80, 78, 86, 90, 94, 100].map((x) => x * (rev / 100))} icon={Icons.trend} />
        <Kpi label={ceo ? t('dash.kpiStudents') : t('dash.kpiActiveStudents')} value={ceo ? '1 842' : '512'} trend={{ up: true, v: '4.1%' }} spark={[70, 72, 74, 73, 78, 82, 85, 88, 90, 92, 96, 100]} icon={Icons.cohort} />
        <Kpi label={t('dash.kpiAttendance')} value="91.2%" accent="var(--sf-primary)" trend={{ up: true, v: '0.8%' }} spark={[88, 90, 87, 91, 89, 92, 90, 93, 91, 92, 90, 91]} icon={Icons.check} />
        <Kpi label={t('dash.kpiChurn')} value="3.4%" accent="var(--sf-danger)" trend={{ up: false, v: '0.6%' }} sub={t('dash.churnTarget')} icon={Icons.trend} />
        <Kpi label={t('dash.kpiDebt')} money={ceo ? 84000000 : 22400000} accent="var(--sf-warn)" sub={ceo ? t('dash.debtFamiliesCeo') : t('dash.debtFamiliesManager')} icon={Icons.flag} />
        {ceo ? (
          <Kpi label={t('dash.kpiNps')} value="72" accent="var(--sf-accent)" trend={{ up: true, v: '5' }} sub={t('dash.npsSub')} icon={Icons.star} />
        ) : (
          <Kpi label={t('dash.kpiPending')} value="7" accent="var(--sf-warn)" sub={t('dash.pendingSub')} icon={Icons.check} />
        )}
      </div>

      <div className="ad-dash-grid">
        <div className="ad-dash-l">
          <Card
            title={ceo ? t('dash.revDynamicsCeo') : t('dash.revDynamicsManager')}
            action={<Segmented value={range} onChange={setRange} options={[{ id: '12', label: t('common.m12') }, { id: '6', label: t('common.m6') }, { id: 'ytd', label: t('common.ytd') }]} />}
          >
            <AreaChart color="var(--sf-success)" data={REV_SERIES} labels={MONTHS} />
            <div className="ad-chart-foot">
              <div><span className="ad-cf-l">{t('dash.yearForecast')}</span><Money uzs={rev * 12.4} className="ad-cf-v" /></div>
              <div><span className="ad-cf-l">{t('dash.avgCheck')}</span><Money uzs={680000} className="ad-cf-v" /></div>
              <div><span className="ad-cf-l">{t('dash.payRate')}</span><span className="ad-cf-v sf-mono">94.2%</span></div>
            </div>
          </Card>

          {ceo ? (
            <Card title={t('dash.branchesRating')} action={<a className="ad-link" onClick={() => onNav('branches')}>{t('common.detail')} ›</a>}>
              <HBars money rows={[
                { label: 'Yunusobod', v: 342000000, mark: true, color: 'var(--sf-primary)' },
                { label: 'Chilonzor', v: 318000000, mark: true, color: 'var(--sf-primary)' },
                { label: 'Mirobod', v: 308000000, mark: true, color: 'var(--sf-accent)' },
                { label: 'Sebzor', v: 216000000, mark: true, color: 'var(--sf-ink-2)' },
              ]} />
            </Card>
          ) : (
            <Card title={t('dash.todayApproval')} action={<a className="ad-link" onClick={() => onNav('approvals')}>{approvals.length} ›</a>} pad={false}>
              {approvals.length === 0 && <div style={{ padding: '20px 16px', fontSize: 12.5, color: 'var(--sf-muted)' }}>{t('approvals.empty')}</div>}
              {approvals.slice(0, 3).map((ap, i, arr) => (
                <div key={ap.id} className="ad-appr-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--sf-border)' : 'none' }}>
                  <div className="ad-appr-ic" style={{ background: 'var(--sf-warn-soft)', color: 'var(--sf-warn)' }}>
                    {cloneElement(ap.kind === 'refund' ? Icons.trend : ap.kind === 'leave' ? Icons.cal : Icons.brand, { size: 16 })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ad-appr-t">{ap.t} · {ap.who}</div>
                    <div className="ad-appr-s">{ap.sub}{ap.amt ? <> · <Money uzs={ap.amt} /></> : null}</div>
                  </div>
                  <div className="ad-appr-acts">
                    <button className="ad-mini-btn ok" onClick={() => a.approve(ap.who, { onConfirm: () => removeApproval(ap.id) })}>{cloneElement(Icons.check, { size: 15 })}</button>
                    <button className="ad-mini-btn no" onClick={() => a.reject(ap.who, { onConfirm: () => removeApproval(ap.id) })}>{cloneElement(Icons.x, { size: 15 })}</button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          <Card title={ceo ? t('dash.teachersRatingCeo') : t('dash.staffActivity')} action={<a className="ad-link" onClick={() => onNav('teachers')}>{t('common.viewAll')} ›</a>} pad={false}>
            <DataTable cols={[
              { label: t('cols.teacher') }, { label: t('cols.branch') }, { label: t('cols.group'), align: 'right' },
              { label: t('cols.attendance'), align: 'right' }, { label: t('cols.cards'), align: 'right' }, { label: t('cols.rating'), align: 'right' },
            ]}>
              {TEACHERS.map((tc, i) => (
                <tr key={i} onClick={() => onNav('teachers')}>
                  <td><div className="ad-cell-u"><SfAvatar name={tc.n} size={28} /><span style={{ fontWeight: 600 }}>{tc.n}</span></div></td>
                  <td style={{ color: 'var(--sf-muted)' }}>{tc.b}</td>
                  <td align="right" className="sf-mono">{tc.g}</td>
                  <td align="right"><span className="sf-mono" style={{ fontWeight: 700, color: tc.att >= 92 ? 'var(--sf-success)' : 'var(--sf-warn)' }}>{tc.att}%</span></td>
                  <td align="right"><span className="sf-mono" style={{ color: '#7A4F0E', fontWeight: 700 }}>↑{tc.up}</span> <span className="sf-mono" style={{ color: 'var(--sf-danger)', fontWeight: 700 }}>↓{tc.down}</span></td>
                  <td align="right"><Pill tone="success">★ {tc.r}</Pill></td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </div>

        <div className="ad-dash-r">
          <div className="ad-ai-card" onClick={() => onNav('ai')}>
            <div className="ad-ai-glow" />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <SfAiBadge>{t('dash.aiStrategic')}</SfAiBadge>
                <span style={{ fontSize: 11, color: 'var(--sf-muted)' }}>3</span>
              </div>
              <div className="ad-ai-quote">“{ceo ? t('dash.aiQuoteCeo') : t('dash.aiQuoteManager')}”</div>
              <div className="ad-ai-chips">
                <Pill tone="ai">{t('dash.aiCause')}</Pill>
                <Pill tone="ai">{t('dash.aiActionPlan')}</Pill>
              </div>
            </div>
          </div>

          <Card title={t('dash.studentFlow')}>
            <div className="ad-flow">
              <div className="ad-flow-row"><span className="ad-flow-l" style={{ color: 'var(--sf-success)' }}>{t('dash.flowNew')}</span><span className="sf-mono">86</span><Bar pct={86} color="var(--sf-success)" /></div>
              <div className="ad-flow-row"><span className="ad-flow-l" style={{ color: 'var(--sf-primary)' }}>{t('dash.flowContinue')}</span><span className="sf-mono">1 698</span><Bar pct={96} color="var(--sf-primary)" /></div>
              <div className="ad-flow-row"><span className="ad-flow-l" style={{ color: 'var(--sf-danger)' }}>{t('dash.flowLeft')}</span><span className="sf-mono">58</span><Bar pct={28} color="var(--sf-danger)" /></div>
            </div>
            <div className="ad-flow-net">{t('dash.netGrowth')} <span className="sf-mono" style={{ color: 'var(--sf-success)', fontWeight: 700 }}>+28</span> · {t('common.thisMonth')}</div>
          </Card>

          <Card title={t('dash.attHealth')}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Donut size={120} segments={[{ v: 72, c: 'var(--sf-success)' }, { v: 19, c: 'var(--sf-warn)' }, { v: 9, c: 'var(--sf-danger)' }]} center={<><div className="sf-mono" style={{ fontSize: 22, fontWeight: 700 }}>91%</div><div style={{ fontSize: 9, color: 'var(--sf-muted)', textTransform: 'uppercase' }}>{t('dash.attLabel')}</div></>} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Legend c="var(--sf-success)" l={t('dash.attGood')} v="72%" />
                <Legend c="var(--sf-warn)" l={t('dash.attMid')} v="19%" />
                <Legend c="var(--sf-danger)" l={t('dash.attLow')} v="9%" />
                <div className="ad-card-mini-row">
                  <span className="sf-mono" style={{ color: '#7A4F0E', fontWeight: 700 }}>↑ 248</span>
                  <span className="sf-mono" style={{ color: 'var(--sf-danger)', fontWeight: 700 }}>↓ 42</span>
                  <span style={{ fontSize: 10, color: 'var(--sf-muted)' }}>{t('dash.cardsWeek')}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title={t('dash.recentEvents')} pad={false}>
            {EVENTS.map((e, i, arr) => (
              <div key={i} className="ad-event" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--sf-border)' : 'none' }}>
                <div className="ad-event-ic" style={{ background: e.c + '22', color: e.c }}>{cloneElement(e.icon, { size: 13 })}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div className="ad-event-t">{e.t}</div><div className="ad-event-w">{e.who}</div></div>
                <span className="sf-mono" style={{ fontSize: 10, color: 'var(--sf-muted)' }}>{e.tm}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
