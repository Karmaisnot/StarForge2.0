import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi, AreaChart, Donut, Legend } from '../components/charts.jsx';
import { DataTable, FilterBar, Pagination, Segmented } from '../components/common.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { useScope } from '../context/ScopeContext.jsx';
import { paymentMetrics, trendSeries } from '../lib/metrics.js';
import { fmtMoney } from '../lib/format.js';

const PAY_METHODS = ['Click', 'Payme', 'Uzcard', 'Naqd'];
const METHOD_COLORS = {
  Click: 'var(--sf-primary)',
  Payme: 'var(--sf-accent)',
  Uzcard: 'var(--sf-success)',
  Naqd: 'var(--sf-ink-2)',
};
const nowStamp = () => {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const MONTHS = ['Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May'];

export function PaymentsPage({ role }) {
  const { t } = useTranslation();
  const { cur } = usePreferences();
  const a = useActions();
  const { scopeBranch, branchName } = useScope();
  const ceo = role === 'ceo';
  const [seg, setSeg] = useState('income');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const [page, setPage] = useState(1);
  const { items: txns, add } = useCollection('payments');

  const base = useMemo(() => scopeBranch(txns), [scopeBranch, txns]);
  const pm = useMemo(() => paymentMetrics(base), [base]);

  const stTone = { ok: ['success', t('status.paid')], debt: ['danger', t('status.debt')], partial: ['warn', t('status.partial')] };

  const methods = useMemo(() => {
    const counts = {};
    base.forEach((x) => { if (x.m && x.m !== '—') counts[x.m] = (counts[x.m] || 0) + 1; });
    const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
    return PAY_METHODS.filter((m) => counts[m]).map((m) => ({
      label: m,
      color: METHOD_COLORS[m],
      pct: Math.round((counts[m] / total) * 100),
    }));
  }, [base]);
  const onlinePct = methods.filter((m) => m.label !== 'Naqd').reduce((s, m) => s + m.pct, 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = base;
    if (q) list = list.filter((x) => x.st.toLowerCase().includes(q));
    if (chip === 1) list = list.filter((x) => x.st2 === 'ok');
    if (chip === 2) list = list.filter((x) => x.st2 === 'debt');
    if (chip === 3) list = list.filter((x) => x.st2 === 'partial');
    return list;
  }, [base, query, chip]);

  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const record = () =>
    a.create({
      title: t('payments.record'),
      submitLabel: t('payments.record'),
      fields: [
        { name: 'student', label: t('cols.student'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'group', label: t('cols.group'), placeholder: '9-B Algebra' },
        { name: 'amount', label: t('cols.amount'), type: 'number', required: true, placeholder: '600000' },
        { name: 'method', label: t('cols.method'), type: 'select', options: PAY_METHODS },
      ],
      onSubmit: (v) =>
        add({
          id: `tx-${Date.now()}`,
          st: v.student,
          g: v.group || '—',
          b: ceo ? branchName || 'Yunusobod' : 'Yunusobod',
          amt: Number(v.amount) || 0,
          m: v.method || PAY_METHODS[0],
          d: nowStamp(),
          st2: 'ok',
        }),
    });

  const exportRows = () =>
    a.exportData({
      name: t('payments.title'),
      columns: [
        { key: 'st', label: t('cols.student') },
        { key: 'g', label: t('cols.group') },
        { key: 'b', label: t('cols.branch') },
        { key: 'amt', label: t('cols.amount') },
        { key: 'm', label: t('cols.method') },
        { key: 'd', label: t('cols.date') },
      ],
      rows,
      allRows: base,
    });

  const detail = (x) =>
    a.open(x.st, {
      title: x.st,
      sub: x.g,
      icon: Icons.trend,
      rows: [
        [t('cols.group'), x.g],
        [t('cols.branch'), x.b],
        [t('cols.amount'), fmtMoney(x.amt, 'UZS')],
        [t('cols.method'), x.m],
        [t('cols.date'), x.d],
        [t('cols.status'), stTone[x.st2][1]],
      ],
    });

  const chips = [
    { l: t('common.all'), n: pm.count, on: chip === 0 },
    { l: t('status.paid'), n: pm.paid, icon: Icons.check, on: chip === 1 },
    { l: t('status.debt'), n: pm.debtCount, icon: Icons.flag, on: chip === 2 },
    { l: t('status.partial'), n: pm.partial, on: chip === 3 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('payments.title')}
        sub={<>{t('payments.currencyHint')}: <b style={{ color: 'var(--sf-ink)' }}>{cur}</b> {t('payments.currencyHintRest')}</>}
        right={
          <>
            <Button kind="soft" onClick={exportRows}>{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={record}>{cloneElement(Icons.plus, { size: 14 })} {t('payments.record')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid">
        <Kpi label={t('payments.kpiIncome')} money={pm.income} accent="var(--sf-success)" trend={{ up: true, v: '12.4%' }} spark={[60, 68, 64, 72, 70, 78, 82, 80, 88, 92, 96, 100]} />
        <Kpi label={t('payments.kpiToCollect')} money={pm.toCollect} sub={t('payments.toCollectSub')} />
        <Kpi label={t('payments.kpiDebt')} money={pm.debt} accent="var(--sf-danger)" sub={ceo ? t('dash.debtFamiliesCeo') : t('dash.debtFamiliesManager')} icon={Icons.flag} />
        <Kpi label={t('payments.kpiPayRate')} value={`${pm.payRate}%`} accent="var(--sf-primary)" trend={{ up: true, v: '1.1%' }} />
        <Kpi label={t('payments.kpiAvgCheck')} money={pm.avgCheck} />
      </div>
      <div className="ad-dash-grid" style={{ marginBottom: 14 }}>
        <Card title={t('payments.incomeDynamics')} action={<Segmented value={seg} onChange={setSeg} options={[{ id: 'income', label: t('payments.segIncome') }, { id: 'debt', label: t('payments.segDebt') }]} />}>
          <AreaChart color={seg === 'debt' ? 'var(--sf-danger)' : 'var(--sf-success)'} data={seg === 'debt' ? trendSeries(pm.debt, 12, 'down') : trendSeries(pm.income)} labels={MONTHS} />
        </Card>
        <Card title={t('payments.methods')}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Donut size={120} segments={methods.map((m) => ({ v: m.pct, c: m.color }))} center={<><div className="sf-mono" style={{ fontSize: 18, fontWeight: 700 }}>{onlinePct}%</div><div style={{ fontSize: 8, color: 'var(--sf-muted)', textTransform: 'uppercase' }}>{t('payments.donutOnline')}</div></>} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {methods.map((m) => <Legend key={m.label} c={m.color} l={m.label} v={`${m.pct}%`} />)}
            </div>
          </div>
        </Card>
      </div>
      <FilterBar
        search={query}
        onSearch={(v) => { setQuery(v); setPage(1); }}
        searchPlaceholder={t('payments.searchPlaceholder')}
        chips={chips}
        onToggleChip={(i) => { setChip(i); setPage(1); }}
      />
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.student') }, { label: t('cols.group') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.amount'), align: 'right' }, { label: t('cols.method') }, { label: t('cols.date') }, { label: t('cols.status'), align: 'center' },
        ]}>
          {pageRows.map((x, i) => (
            <tr key={x.id || i} onClick={() => detail(x)}>
              <td><div className="ad-cell-u"><SfAvatar name={x.st} size={28} /><span style={{ fontWeight: 600 }}>{x.st}</span></div></td>
              <td><span style={{ fontSize: 12.5 }}>{x.g}</span></td>
              {ceo && <td style={{ color: 'var(--sf-muted)', fontSize: 12.5 }}>{x.b}</td>}
              <td align="right"><Money uzs={x.amt} style={{ fontWeight: 700, color: x.st2 === 'debt' ? 'var(--sf-danger)' : 'var(--sf-ink)' }} /></td>
              <td><span style={{ fontSize: 12 }}>{x.m}</span></td>
              <td><span className="sf-mono" style={{ fontSize: 11.5, color: x.st2 === 'debt' ? 'var(--sf-danger)' : 'var(--sf-muted)' }}>{x.d}</span></td>
              <td align="center"><Pill tone={stTone[x.st2][0]}>{stTone[x.st2][1]}</Pill></td>
            </tr>
          ))}
        </DataTable>
        <Pagination label={`${rows.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–${Math.min(safePage * PAGE_SIZE, rows.length)} ${t('common.of')} ${rows.length}`} page={safePage} pages={pageCount} onPage={setPage} />
      </Card>
    </>
  );
}
