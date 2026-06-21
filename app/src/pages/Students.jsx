import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, FilterBar, Pagination, Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const BRANCH_NAMES = ['Yunusobod', 'Chilonzor', 'Mirobod', 'Sebzor'];
const newStudentId = () => String(Math.floor(10000 + Math.random() * 89999));

const STUDENTS = [
  { n: 'Akbarov Akmal', id: '00042', g: '9-B Algebra', b: 'Yunusobod', att: 96, up: 12, down: 1, pay: 'paid', debt: 0, par: 'Akbarova D.' },
  { n: 'Azizova Madina', id: '00043', g: '9-B Algebra', b: 'Yunusobod', att: 98, up: 8, down: 0, pay: 'paid', debt: 0, par: 'Azizov B.' },
  { n: 'Bakirov Sherzod', id: '00044', g: 'Algebra Mid', b: 'Chilonzor', att: 88, up: 2, down: 2, pay: 'debt', debt: 600000, par: 'Bakirova Z.' },
  { n: 'Davronova Sevinch', id: '00045', g: 'Algebra Mid', b: 'Yunusobod', att: 92, up: 4, down: 0, pay: 'paid', debt: 0, par: 'Davronov T.' },
  { n: 'Eshmatov Otabek', id: '00046', g: '9-B Algebra', b: 'Mirobod', att: 72, up: 1, down: 4, pay: 'debt', debt: 1200000, par: 'Eshmatova G.', risk: true },
  { n: 'Fayzullayev Diyor', id: '00047', g: '10-V Geom', b: 'Yunusobod', att: 94, up: 5, down: 1, pay: 'paid', debt: 0, par: 'Fayzullayev N.' },
  { n: 'G‘aniyev Jasur', id: '00048', g: '10-V Geom', b: 'Sebzor', att: 89, up: 3, down: 1, pay: 'partial', debt: 300000, par: 'G‘aniyeva M.' },
  { n: 'Halimova Zilola', id: '00049', g: '9-B Algebra', b: 'Chilonzor', att: 95, up: 7, down: 0, pay: 'paid', debt: 0, par: 'Halimov R.' },
  { n: 'Ibragimov Sardor', id: '00050', g: 'Algebra Mid', b: 'Yunusobod', att: 91, up: 4, down: 1, pay: 'paid', debt: 0, par: 'Ibragimova S.' },
  { n: 'Karimov Rustam', id: '00052', g: '10-V Geom', b: 'Mirobod', att: 84, up: 2, down: 2, pay: 'debt', debt: 600000, par: 'Karimova D.' },
];

export function StudentsPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);
  const { items: students, add, remove } = useCollection('students', STUDENTS, 'id');

  const payTone = { paid: ['success', t('status.paid')], debt: ['danger', t('status.debt')], partial: ['warn', t('status.partial')] };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = students;
    if (q) list = list.filter((s) => `${s.n} ${s.id} ${s.par}`.toLowerCase().includes(q));
    if (chip === 1) list = list.filter((s) => s.pay === 'paid');
    if (chip === 2) list = list.filter((s) => s.debt > 0);
    if (chip === 3) list = list.filter((s) => s.risk);
    return list;
  }, [students, query, chip]);

  const PAGE_SIZE = 6;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const admit = () =>
    a.create({
      title: t('students.admit'),
      submitLabel: t('students.admit'),
      fields: [
        { name: 'name', label: t('cols.student'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'group', label: t('cols.group'), placeholder: '9-B Algebra' },
        ...(ceo ? [{ name: 'branch', label: t('cols.branch'), type: 'select', options: BRANCH_NAMES }] : []),
        { name: 'parent', label: t('cols.parent') },
      ],
      onSubmit: (v) =>
        add({
          n: v.name,
          id: newStudentId(),
          g: v.group || '—',
          b: ceo ? v.branch || BRANCH_NAMES[0] : 'Yunusobod',
          att: 100,
          up: 0,
          down: 0,
          pay: 'paid',
          debt: 0,
          par: v.parent || '—',
        }),
    });

  const chips = [
    { l: t('common.all'), n: ceo ? 1842 : 512, on: chip === 0 },
    { l: t('students.kpiActive'), icon: Icons.check, on: chip === 1 },
    { l: t('students.chipDebtors'), n: 38, icon: Icons.flag, on: chip === 2 },
    { l: t('students.chipRisk'), n: 6, on: chip === 3 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('nav.students')}
        sub={ceo ? t('students.subCeo') : t('students.subManager')}
        right={
          <>
            <Button kind="soft" onClick={a.exportData}>{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={admit}>{cloneElement(Icons.plus, { size: 14 })} {t('students.admit')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <Kpi label={t('students.kpiTotal')} value={ceo ? '1 842' : '512'} icon={Icons.cohort} />
        <Kpi label={t('students.kpiActive')} value={ceo ? '1 784' : '496'} accent="var(--sf-success)" />
        <Kpi label={t('students.kpiDebt')} value={ceo ? '142' : '38'} accent="var(--sf-danger)" sub={t('students.families')} />
        <Kpi label={t('students.kpiRisk')} value={ceo ? '24' : '6'} accent="var(--sf-warn)" sub={t('students.riskSub')} />
        <Kpi label={t('students.kpiAdmitted')} value="+86" accent="var(--sf-primary)" />
      </div>
      <FilterBar
        search={query}
        onSearch={(v) => { setQuery(v); setPage(1); }}
        searchPlaceholder={t('students.searchPlaceholder')}
        chips={chips}
        onToggleChip={(i) => { setChip(i); setPage(1); }}
        right={<Segmented value={view} onChange={setView} options={[{ id: 'table', label: t('common.table') }, { id: 'card', label: t('common.card') }]} />}
      />
      <Card pad={false}>
        {view === 'card' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(244px, 1fr))', gap: 12, padding: 14 }}>
            {pageRows.map((s) => (
              <div key={s.id} onClick={() => a.open(s.n)} style={{ cursor: 'pointer', background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <SfAvatar name={s.n} size={38} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, display: 'flex', gap: 5, alignItems: 'center' }}>{s.n}{s.risk && <Pill tone="danger">{t('status.risk')}</Pill>}</div>
                    <div className="sf-mono" style={{ fontSize: 10, color: 'var(--sf-muted)' }}>DEMO-2026-{s.id} · {s.g}</div>
                  </div>
                  <button className="ad-row-del" title={t('common.reject')} onClick={(e) => { e.stopPropagation(); remove(s.id); }}>{cloneElement(Icons.x, { size: 14 })}</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Pill tone={payTone[s.pay][0]}>{payTone[s.pay][1]}</Pill>
                  <span className="sf-mono" style={{ fontWeight: 700, color: s.att >= 92 ? 'var(--sf-success)' : s.att >= 85 ? 'var(--sf-warn)' : 'var(--sf-danger)' }}>{s.att}%</span>
                  {s.debt ? <Money uzs={s.debt} style={{ color: 'var(--sf-danger)', fontWeight: 700 }} /> : <span style={{ color: 'var(--sf-muted)', fontSize: 12 }}>—</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
        <DataTable cols={[
          { label: t('cols.student') }, { label: t('cols.group') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.attendance'), align: 'right' }, { label: t('cols.cards'), align: 'center' },
          { label: t('cols.payment'), align: 'center' }, { label: t('cols.debt'), align: 'right' }, { label: t('cols.parent') }, { label: '', align: 'right', w: 40 },
        ]}>
          {pageRows.map((s) => (
            <tr key={s.id} onClick={() => a.open(s.n)}>
              <td><div className="ad-cell-u">
                <SfAvatar name={s.n} size={30} />
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{s.n}{s.risk && <Pill tone="danger">{t('status.risk')}</Pill>}</div>
                  <div className="sf-mono" style={{ fontSize: 10, color: 'var(--sf-muted)' }}>DEMO-2026-{s.id}</div>
                </div>
              </div></td>
              <td><span style={{ fontSize: 12.5 }}>{s.g}</span></td>
              {ceo && <td style={{ color: 'var(--sf-muted)', fontSize: 12.5 }}>{s.b}</td>}
              <td align="right"><span className="sf-mono" style={{ fontWeight: 700, color: s.att >= 92 ? 'var(--sf-success)' : s.att >= 85 ? 'var(--sf-warn)' : 'var(--sf-danger)' }}>{s.att}%</span></td>
              <td align="center"><span className="sf-mono" style={{ color: '#7A4F0E', fontWeight: 700, fontSize: 12 }}>↑{s.up}</span> <span className="sf-mono" style={{ color: s.down ? 'var(--sf-danger)' : 'var(--sf-muted)', fontWeight: 700, fontSize: 12 }}>↓{s.down}</span></td>
              <td align="center"><Pill tone={payTone[s.pay][0]}>{payTone[s.pay][1]}</Pill></td>
              <td align="right">{s.debt ? <Money uzs={s.debt} style={{ color: 'var(--sf-danger)', fontWeight: 700 }} /> : <span style={{ color: 'var(--sf-muted)' }}>—</span>}</td>
              <td><span style={{ fontSize: 12, color: 'var(--sf-muted)' }}>{s.par}</span></td>
              <td align="right">
                <button
                  className="ad-row-del"
                  title={t('common.reject')}
                  onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                >
                  {cloneElement(Icons.x, { size: 14 })}
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
        )}
        <Pagination label={`${rows.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–${Math.min(safePage * PAGE_SIZE, rows.length)} ${t('common.of')} ${rows.length}`} page={safePage} pages={pageCount} onPage={setPage} />
      </Card>
    </>
  );
}
