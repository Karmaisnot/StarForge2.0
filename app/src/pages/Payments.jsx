import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi, AreaChart, Donut, Legend } from '../components/charts.jsx';
import { DataTable, FilterBar, Segmented } from '../components/common.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const PAY_METHODS = ['Click', 'Payme', 'Uzcard', 'Naqd'];
const nowStamp = () => {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const MONTHS = ['Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek', 'Yan', 'Fev', 'Mar', 'Apr', 'May'];
const SERIES = [820, 860, 910, 890, 960, 1020, 1080, 1040, 1140, 1180, 1220, 1284].map((x) => x * 1e6);
const DEBT_SERIES = [180, 172, 165, 158, 150, 142, 138, 130, 124, 118, 110, 102].map((x) => x * 1e6);

const TXNS = [
  { st: 'Akbarov Akmal', g: '9-B Algebra', b: 'Yunusobod', amt: 600000, m: 'Click', d: '19.05 09:42', st2: 'ok' },
  { st: 'Halimova Zilola', g: '9-B Algebra', b: 'Chilonzor', amt: 600000, m: 'Payme', d: '19.05 08:10', st2: 'ok' },
  { st: 'Bakirov Sherzod', g: 'Algebra Mid', b: 'Chilonzor', amt: 600000, m: '—', d: 'Muddat 15.05', st2: 'debt' },
  { st: 'Ibragimov Sardor', g: 'Algebra Mid', b: 'Yunusobod', amt: 850000, m: 'Naqd', d: '18.05 16:30', st2: 'ok' },
  { st: 'G‘aniyev Jasur', g: '10-V Geom', b: 'Sebzor', amt: 300000, m: 'Uzcard', d: '18.05 14:05', st2: 'partial' },
  { st: 'Eshmatov Otabek', g: '9-B Algebra', b: 'Mirobod', amt: 1200000, m: '—', d: 'Muddat 10.05', st2: 'debt' },
  { st: 'Davronova Sevinch', g: 'Algebra Mid', b: 'Yunusobod', amt: 600000, m: 'Click', d: '17.05 11:20', st2: 'ok' },
];

export function PaymentsPage({ role }) {
  const { t } = useTranslation();
  const { cur } = usePreferences();
  const a = useActions();
  const ceo = role === 'ceo';
  const [seg, setSeg] = useState('income');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const { items: txns, add } = useCollection('payments', TXNS, 'id');

  const stTone = { ok: ['success', t('status.paid')], debt: ['danger', t('status.debt')], partial: ['warn', t('status.partial')] };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = txns;
    if (q) list = list.filter((x) => x.st.toLowerCase().includes(q));
    if (chip === 1) list = list.filter((x) => x.st2 === 'ok');
    if (chip === 2) list = list.filter((x) => x.st2 === 'debt');
    if (chip === 3) list = list.filter((x) => x.st2 === 'partial');
    return list;
  }, [txns, query, chip]);

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
          b: ceo ? 'Yunusobod' : 'Yunusobod',
          amt: Number(v.amount) || 0,
          m: v.method || PAY_METHODS[0],
          d: nowStamp(),
          st2: 'ok',
        }),
    });

  const chips = [
    { l: t('common.all'), on: chip === 0 },
    { l: t('status.paid'), n: 1842, icon: Icons.check, on: chip === 1 },
    { l: t('status.debt'), n: 142, icon: Icons.flag, on: chip === 2 },
    { l: t('status.partial'), n: 24, on: chip === 3 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('payments.title')}
        sub={<>{t('payments.currencyHint')}: <b style={{ color: 'var(--sf-ink)' }}>{cur}</b> {t('payments.currencyHintRest')}</>}
        right={
          <>
            <Button kind="soft" onClick={a.exportData}>{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={record}>{cloneElement(Icons.plus, { size: 14 })} {t('payments.record')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid">
        <Kpi label={t('payments.kpiIncome')} money={ceo ? 1284000000 : 342000000} accent="var(--sf-success)" trend={{ up: true, v: '12.4%' }} spark={[60, 68, 64, 72, 70, 78, 82, 80, 88, 92, 96, 100]} />
        <Kpi label={t('payments.kpiToCollect')} money={ceo ? 1420000000 : 380000000} sub={t('payments.toCollectSub')} />
        <Kpi label={t('payments.kpiDebt')} money={ceo ? 84000000 : 22400000} accent="var(--sf-danger)" sub={ceo ? t('dash.debtFamiliesCeo') : t('dash.debtFamiliesManager')} icon={Icons.flag} />
        <Kpi label={t('payments.kpiPayRate')} value="94.2%" accent="var(--sf-primary)" trend={{ up: true, v: '1.1%' }} />
        <Kpi label={t('payments.kpiAvgCheck')} money={680000} />
      </div>
      <div className="ad-dash-grid" style={{ marginBottom: 14 }}>
        <Card title={t('payments.incomeDynamics')} action={<Segmented value={seg} onChange={setSeg} options={[{ id: 'income', label: t('payments.segIncome') }, { id: 'debt', label: t('payments.segDebt') }]} />}>
          <AreaChart color={seg === 'debt' ? 'var(--sf-danger)' : 'var(--sf-success)'} data={seg === 'debt' ? DEBT_SERIES : SERIES} labels={MONTHS} />
        </Card>
        <Card title={t('payments.methods')}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Donut size={120} segments={[{ v: 42, c: 'var(--sf-primary)' }, { v: 28, c: 'var(--sf-accent)' }, { v: 18, c: 'var(--sf-success)' }, { v: 12, c: 'var(--sf-ink-2)' }]} center={<><div className="sf-mono" style={{ fontSize: 18, fontWeight: 700 }}>94%</div><div style={{ fontSize: 8, color: 'var(--sf-muted)', textTransform: 'uppercase' }}>{t('payments.donutOnline')}</div></>} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Legend c="var(--sf-primary)" l="Click" v="42%" />
              <Legend c="var(--sf-accent)" l="Payme" v="28%" />
              <Legend c="var(--sf-success)" l="Uzcard" v="18%" />
              <Legend c="var(--sf-ink-2)" l="Naqd" v="12%" />
            </div>
          </div>
        </Card>
      </div>
      <FilterBar search={query} onSearch={setQuery} searchPlaceholder={t('payments.searchPlaceholder')} chips={chips} onToggleChip={setChip} />
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.student') }, { label: t('cols.group') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.amount'), align: 'right' }, { label: t('cols.method') }, { label: t('cols.date') }, { label: t('cols.status'), align: 'center' },
        ]}>
          {rows.map((x, i) => (
            <tr key={x.id || i} onClick={() => a.open(x.st)}>
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
      </Card>
    </>
  );
}
