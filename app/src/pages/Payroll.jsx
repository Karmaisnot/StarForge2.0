import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar, SfAiBadge } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';

const ROWS = [
  { n: 'Nigora Karimova', dept: 'Matematika', base: 6000000, cards: 900000, att: 600000, ret: 900000 },
  { n: 'Aziz Tursunov', dept: 'Ingliz tili', base: 5500000, cards: 1100000, att: 600000, ret: 600000 },
  { n: 'Bobur Aliyev', dept: 'Matematika', base: 5500000, cards: 750000, att: 500000, ret: 850000 },
  { n: 'Sevara Olimova', dept: 'Matematika', base: 3500000, cards: 400000, att: 300000, ret: 0 },
  { n: 'Malika Yusupova', dept: 'Tabiiy fanlar', base: 5500000, cards: 600000, att: 400000, ret: 700000 },
  { n: 'Gulnora Saidova', dept: 'Qabul', base: 5000000, cards: 0, att: 400000, ret: 200000 },
];
const MONTH_FACTOR = { may: 1, apr: 0.96, mar: 0.92 };

export function PayrollPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [month, setMonth] = useState('may');
  // The month segment really re-scales the run — base + every bonus column.
  const f = MONTH_FACTOR[month] ?? 1;
  const rows = ROWS.map((r) => ({ ...r, base: Math.round(r.base * f), cards: Math.round(r.cards * f), att: Math.round(r.att * f), ret: Math.round(r.ret * f) }));
  const sum = (sel) => rows.reduce((a, r) => a + sel(r), 0);
  const tot = sum((r) => r.base + r.cards + r.att + r.ret);

  return (
    <>
      <PageHeader
        eyebrow={t('payroll.eyebrow')}
        title={t('payroll.title')}
        sub={t('payroll.sub')}
        right={
          <>
            <Segmented value={month} onChange={setMonth} options={[{ id: 'may', label: 'May' }, { id: 'apr', label: 'Aprel' }, { id: 'mar', label: 'Mart' }]} />
            <Button kind="primary" onClick={a.approve}>{cloneElement(Icons.check, { size: 14 })} {t('payroll.approvePay')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid">
        <Kpi label={t('payroll.kpiFund')} money={tot} accent="var(--sf-success)" icon={Icons.trend} />
        <Kpi label={t('payroll.kpiBase')} money={sum((r) => r.base)} />
        <Kpi label={t('payroll.kpiBonus')} money={sum((r) => r.cards + r.att + r.ret)} accent="var(--sf-accent)" sub={t('payroll.bonusSub')} />
        <Kpi label={t('payroll.kpiStaff')} value={ceo ? '82' : '16'} />
        <Kpi label={t('payroll.kpiState')} value={t('payroll.draft')} accent="var(--sf-warn)" sub={t('payroll.stateSub')} />
      </div>
      <div className="og-payroll-note">
        <SfAiBadge compact>{t('payroll.autoCalc')}</SfAiBadge>
        <span>{t('payroll.formula')}</span>
      </div>
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.staffMember') }, { label: t('cols.department') }, { label: t('payroll.colBase'), align: 'right' },
          { label: t('payroll.colCardBonus'), align: 'right' }, { label: t('payroll.colAttBonus'), align: 'right' }, { label: t('payroll.colRetention'), align: 'right' },
          { label: t('payroll.colTotal'), align: 'right' }, { label: t('cols.status'), align: 'center' },
        ]}>
          {rows.map((r, i) => {
            const total = r.base + r.cards + r.att + r.ret;
            return (
              <tr key={i}>
                <td><div className="ad-cell-u"><SfAvatar name={r.n} size={28} /><span style={{ fontWeight: 600 }}>{r.n}</span></div></td>
                <td style={{ fontSize: 12, color: 'var(--sf-muted)' }}>{r.dept}</td>
                <td align="right"><Money uzs={r.base} /></td>
                <td align="right"><Money uzs={r.cards} style={{ color: r.cards ? '#7A4F0E' : 'var(--sf-muted)' }} /></td>
                <td align="right"><Money uzs={r.att} style={{ color: 'var(--sf-success)' }} /></td>
                <td align="right"><Money uzs={r.ret} style={{ color: r.ret ? 'var(--sf-primary)' : 'var(--sf-muted)' }} /></td>
                <td align="right"><Money uzs={total} style={{ fontWeight: 800, fontSize: 13 }} /></td>
                <td align="center"><Pill tone="success" dot>{t('status.ready')}</Pill></td>
              </tr>
            );
          })}
          <tr style={{ background: 'var(--sf-surface-2)', fontWeight: 700 }}>
            <td colSpan={2} style={{ fontWeight: 800 }}>{t('payroll.totalRow')} · {rows.length} {t('payroll.staffWord')}</td>
            <td align="right"><Money uzs={sum((r) => r.base)} /></td>
            <td align="right"><Money uzs={sum((r) => r.cards)} /></td>
            <td align="right"><Money uzs={sum((r) => r.att)} /></td>
            <td align="right"><Money uzs={sum((r) => r.ret)} /></td>
            <td align="right"><Money uzs={tot} style={{ fontWeight: 800, fontSize: 14, color: 'var(--sf-success)' }} /></td>
            <td />
          </tr>
        </DataTable>
      </Card>
    </>
  );
}
