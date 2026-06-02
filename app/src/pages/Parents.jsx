import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, FilterBar } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const PARENTS = [
  { n: 'Akbarova Dilnoza', ch: 'Akbarov Akmal', rel: 'Ona', ph: '+998 90 222 11 33', b: 'Yunusobod', tel: true, debt: 0, msgs: 12 },
  { n: 'Bakirova Zarnigor', ch: 'Bakirov Sherzod', rel: 'Ona', ph: '+998 91 444 55 66', b: 'Chilonzor', tel: true, debt: 600000, msgs: 4 },
  { n: 'Eshmatova Gulnora', ch: 'Eshmatov Otabek', rel: 'Ona', ph: '+998 93 111 22 44', b: 'Mirobod', tel: false, debt: 1200000, msgs: 8, esc: true },
  { n: 'Davronov Temur', ch: 'Davronova Sevinch', rel: 'Ota', ph: '+998 90 555 66 77', b: 'Yunusobod', tel: true, debt: 0, msgs: 2 },
  { n: 'Halimov Rustam', ch: 'Halimova Zilola', rel: 'Ota', ph: '+998 94 888 99 00', b: 'Chilonzor', tel: true, debt: 0, msgs: 6 },
];

export function ParentsPage({ role, onNav }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const { items: parents, remove } = useCollection('parents', PARENTS, 'n');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = parents;
    if (q) list = list.filter((p) => `${p.n} ${p.ch}`.toLowerCase().includes(q));
    if (chip === 1) list = list.filter((p) => p.esc);
    if (chip === 2) list = list.filter((p) => p.debt > 0);
    if (chip === 3) list = list.filter((p) => !p.tel);
    return list;
  }, [parents, query, chip]);

  const chips = [
    { l: t('common.all'), on: chip === 0 },
    { l: t('parents.chipEscalation'), n: 3, icon: Icons.flag, on: chip === 1 },
    { l: t('students.chipDebtors'), n: 38, on: chip === 2 },
    { l: t('parents.chipNoTelegram'), n: 64, on: chip === 3 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('parents.title')}
        sub={t('parents.sub')}
        right={<Button kind="primary" onClick={a.send}>{cloneElement(Icons.send, { size: 14 })} {t('parents.broadcast')}</Button>}
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('parents.kpiTotal')} value={ceo ? '1 624' : '448'} icon={Icons.chat} />
        <Kpi label={t('parents.kpiTelegram')} value="82%" accent="var(--sf-primary)" />
        <Kpi label={t('parents.kpiEscalation')} value={ceo ? '8' : '3'} accent="var(--sf-danger)" sub={t('parents.escalationSub')} icon={Icons.flag} />
        <Kpi label={t('parents.kpiResponse')} value="14 daq" accent="var(--sf-success)" />
      </div>
      <FilterBar search={query} onSearch={setQuery} searchPlaceholder={t('parents.searchPlaceholder')} chips={chips} onToggleChip={setChip} />
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.parent') }, { label: t('cols.student') }, { label: t('cols.contact') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.telegram'), align: 'center' }, { label: t('cols.debt'), align: 'right' }, { label: t('cols.chat'), align: 'center' }, { label: '', align: 'right', w: 40 },
        ]}>
          {rows.map((p) => (
            <tr key={p.n} onClick={() => a.open(p.n)}>
              <td><div className="ad-cell-u"><SfAvatar name={p.n} size={30} /><div><div style={{ fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center' }}>{p.n}{p.esc && <Pill tone="danger">{t('status.escalation')}</Pill>}</div><div style={{ fontSize: 10.5, color: 'var(--sf-muted)' }}>{p.rel}</div></div></div></td>
              <td><span style={{ fontSize: 12.5 }}>{p.ch}</span></td>
              <td><span className="sf-mono" style={{ fontSize: 11.5, color: 'var(--sf-muted)' }}>{p.ph}</span></td>
              {ceo && <td style={{ color: 'var(--sf-muted)', fontSize: 12.5 }}>{p.b}</td>}
              <td align="center">{p.tel ? <Pill tone="primary" dot>{t('status.connected')}</Pill> : <Pill>{t('status.no')}</Pill>}</td>
              <td align="right">{p.debt ? <Money uzs={p.debt} style={{ color: 'var(--sf-danger)', fontWeight: 700 }} /> : <span style={{ color: 'var(--sf-muted)' }}>—</span>}</td>
              <td align="center"><button className="ad-chat-btn" onClick={(e) => { e.stopPropagation(); onNav('chats'); }}>{cloneElement(Icons.chat, { size: 14 })} {p.msgs}</button></td>
              <td align="right">
                <button className="ad-row-del" title={t('common.reject')} onClick={(e) => { e.stopPropagation(); remove(p.n); }}>
                  {cloneElement(Icons.x, { size: 14 })}
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </>
  );
}
