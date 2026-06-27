import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, FilterBar, Pagination } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { useScope } from '../context/ScopeContext.jsx';
import { parentMetrics } from '../lib/metrics.js';
import { fmtMoney } from '../lib/format.js';

export function ParentsPage({ role, onNav }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const { scopeBranch } = useScope();
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const [page, setPage] = useState(1);
  const { items: parents, remove } = useCollection('parents');
  const base = useMemo(() => scopeBranch(parents), [parents, scopeBranch]);
  const m = useMemo(() => parentMetrics(base), [base]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = base;
    if (q) list = list.filter((p) => `${p.n} ${p.ch}`.toLowerCase().includes(q));
    if (chip === 1) list = list.filter((p) => p.esc);
    if (chip === 2) list = list.filter((p) => p.debt > 0);
    if (chip === 3) list = list.filter((p) => !p.tel);
    return list;
  }, [base, query, chip]);

  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openParent = (p) =>
    a.open(p.n, {
      title: p.n,
      sub: p.rel,
      icon: Icons.user,
      rows: [
        [t('cols.student'), p.ch],
        [t('cols.relation'), p.rel],
        [t('cols.contact'), p.ph],
        [t('cols.branch'), p.b],
        [t('cols.telegram'), p.tel ? t('status.connected') : t('status.no')],
        [t('cols.debt'), p.debt ? fmtMoney(p.debt, 'UZS') : '—'],
        [t('cols.chat'), String(p.msgs)],
      ],
    });

  const broadcast = () => a.send({ sub: `${base.length} ${t('shell.studentsWord')}` });

  const chips = [
    { l: t('common.all'), n: m.total, on: chip === 0 },
    { l: t('parents.chipEscalation'), n: m.escalations, icon: Icons.flag, on: chip === 1 },
    { l: t('students.chipDebtors'), n: m.debtors, on: chip === 2 },
    { l: t('parents.chipNoTelegram'), n: m.noTelegram, on: chip === 3 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('parents.title')}
        sub={t('parents.sub')}
        right={<Button kind="primary" onClick={broadcast}>{cloneElement(Icons.send, { size: 14 })} {t('parents.broadcast')}</Button>}
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('parents.kpiTotal')} value={m.total} icon={Icons.chat} />
        <Kpi label={t('parents.kpiTelegram')} value={`${m.telegramPct}%`} accent="var(--sf-primary)" />
        <Kpi label={t('parents.kpiEscalation')} value={m.escalations} accent="var(--sf-danger)" sub={t('parents.escalationSub')} icon={Icons.flag} />
        <Kpi label={t('parents.kpiResponse')} value="14 daq" accent="var(--sf-success)" />
      </div>
      <FilterBar
        search={query}
        onSearch={(v) => { setQuery(v); setPage(1); }}
        searchPlaceholder={t('parents.searchPlaceholder')}
        chips={chips}
        onToggleChip={(i) => { setChip(i); setPage(1); }}
      />
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.parent') }, { label: t('cols.student') }, { label: t('cols.contact') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.telegram'), align: 'center' }, { label: t('cols.debt'), align: 'right' }, { label: t('cols.chat'), align: 'center' }, { label: '', align: 'right', w: 40 },
        ]}>
          {pageRows.map((p) => (
            <tr key={p.n} onClick={() => openParent(p)}>
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
        <Pagination label={`${rows.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–${Math.min(safePage * PAGE_SIZE, rows.length)} ${t('common.of')} ${rows.length}`} page={safePage} pages={pageCount} onPage={setPage} />
      </Card>
    </>
  );
}
