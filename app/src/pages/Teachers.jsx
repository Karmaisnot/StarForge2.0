import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, FilterBar, Pagination } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { useScope } from '../context/ScopeContext.jsx';
import { BRANCH_NAMES } from '../data/dataset.js';
import { teacherMetrics } from '../lib/metrics.js';
import { fmtMoney } from '../lib/format.js';

export function TeachersPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const [page, setPage] = useState(1);
  const { scopeBranch } = useScope();
  const { items: teachers, add } = useCollection('teachers');
  const base = useMemo(() => scopeBranch(teachers), [scopeBranch, teachers]);
  const m = useMemo(() => teacherMetrics(base), [base]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = base;
    if (q) list = list.filter((tc) => `${tc.n} ${tc.sub}`.toLowerCase().includes(q));
    if (chip === 1) list = list.filter((tc) => /o['‘]?qit/i.test(tc.role));
    if (chip === 2) list = list.filter((tc) => /assistent/i.test(tc.role));
    if (chip === 3) list = list.filter((tc) => tc.st2 === 'active');
    if (chip === 4) list = list.filter((tc) => tc.st2 === 'review');
    return list;
  }, [base, query, chip]);

  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const addStaff = () =>
    a.create({
      title: t('teachers.addStaff'),
      fields: [
        { name: 'name', label: t('cols.staffMember'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'role', label: t('cols.position'), placeholder: 'O‘qituvchi' },
        { name: 'sub', label: t('cols.subject'), placeholder: 'Matematika' },
        ...(ceo ? [{ name: 'branch', label: t('cols.branch'), type: 'select', options: BRANCH_NAMES }] : []),
        { name: 'sal', label: t('cols.salary'), type: 'number', placeholder: '7000000' },
      ],
      onSubmit: (v) =>
        add({
          n: v.name,
          role: v.role || 'O‘qituvchi',
          b: ceo ? v.branch || BRANCH_NAMES[0] : 'Yunusobod',
          sub: v.sub || '—',
          g: 0,
          st: 0,
          att: 100,
          up: 0,
          down: 0,
          r: 5,
          sal: Number(v.sal) || 7000000,
          st2: 'active',
        }),
    });

  const chips = [
    { l: t('common.all'), n: m.total, on: chip === 0 },
    { l: t('cols.teacher'), n: m.teaching, on: chip === 1 },
    { l: t('permissions.roleAssistant'), n: m.assistants, on: chip === 2 },
    { l: t('status.active'), n: m.active, icon: Icons.check, on: chip === 3 },
    { l: t('teachers.kpiReview'), n: m.review, icon: Icons.flag, on: chip === 4 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('teachers.eyebrowCeo') : t('teachers.eyebrowManager')}
        title={ceo ? t('nav.teachers') : t('nav.staff')}
        sub={t('teachers.sub')}
        right={
          <>
            {!ceo && <Button kind="soft" onClick={a.task}>{cloneElement(Icons.check, { size: 14 })} {t('teachers.assignTask')}</Button>}
            <Button
              kind="soft"
              onClick={() => a.exportData({
                name: ceo ? t('nav.teachers') : t('nav.staff'),
                columns: [
                  { key: 'n', label: t('cols.staffMember') },
                  { key: 'role', label: t('cols.position') },
                  { key: 'sub', label: t('cols.subject') },
                  { key: 'b', label: t('cols.branch') },
                  { key: 'g', label: t('cols.group') },
                  { key: 'st', label: t('teachers.colStudents') },
                  { key: 'att', label: t('cols.attendance') },
                  { key: 'r', label: t('cols.rating') },
                  { key: 'sal', label: t('cols.salary') },
                  { key: 'st2', label: t('cols.status') },
                ],
                rows,
                allRows: base,
              })}
            >{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={addStaff}>{cloneElement(Icons.plus, { size: 14 })} {t('teachers.addStaff')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('teachers.kpiTotal')} value={String(m.total)} icon={Icons.user} />
        <Kpi label={t('teachers.kpiRating')} value={String(m.avgRating)} accent="var(--sf-accent)" sub={t('teachers.ratingSub')} icon={Icons.star} />
        <Kpi label={t('teachers.kpiFund')} money={m.fund} accent="var(--sf-success)" icon={Icons.trend} />
        <Kpi label={t('teachers.kpiReview')} value={String(m.review)} accent="var(--sf-warn)" sub={t('teachers.reviewSub')} />
      </div>
      <FilterBar
        search={query}
        onSearch={(v) => { setQuery(v); setPage(1); }}
        searchPlaceholder={t('teachers.searchPlaceholder')}
        chips={chips}
        onToggleChip={(i) => { setChip(i); setPage(1); }}
      />
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.staffMember') }, { label: t('cols.subject') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.group'), align: 'right' }, { label: t('teachers.colStudents'), align: 'right' }, { label: t('cols.attendance'), align: 'right' },
          { label: t('cols.cards'), align: 'center' }, { label: t('cols.rating'), align: 'center' }, { label: t('cols.salary'), align: 'right' }, { label: t('cols.status'), align: 'center' },
        ]}>
          {pageRows.map((tc) => (
            <tr key={tc.n} onClick={() => a.open(tc.n, {
              title: tc.n,
              sub: tc.role,
              icon: Icons.user,
              rows: [
                [t('cols.subject'), tc.sub],
                [t('cols.branch'), tc.b],
                [t('cols.group'), String(tc.g)],
                [t('teachers.colStudents'), String(tc.st)],
                [t('cols.attendance'), tc.att + '%'],
                [t('cols.rating'), '★ ' + tc.r],
                [t('cols.salary'), fmtMoney(tc.sal, 'UZS')],
                [t('cols.status'), tc.st2 === 'active' ? t('status.active') : t('status.review')],
              ],
            })}>
              <td><div className="ad-cell-u"><SfAvatar name={tc.n} size={30} /><div><div style={{ fontWeight: 600 }}>{tc.n}</div><div style={{ fontSize: 10.5, color: 'var(--sf-muted)' }}>{tc.role}</div></div></div></td>
              <td><span style={{ fontSize: 12.5 }}>{tc.sub}</span></td>
              {ceo && <td style={{ color: 'var(--sf-muted)', fontSize: 12.5 }}>{tc.b}</td>}
              <td align="right" className="sf-mono">{tc.g}</td>
              <td align="right" className="sf-mono">{tc.st}</td>
              <td align="right"><span className="sf-mono" style={{ fontWeight: 700, color: tc.att >= 92 ? 'var(--sf-success)' : tc.att >= 85 ? 'var(--sf-warn)' : 'var(--sf-danger)' }}>{tc.att}%</span></td>
              <td align="center"><span className="sf-mono" style={{ color: '#7A4F0E', fontWeight: 700, fontSize: 12 }}>↑{tc.up}</span> <span className="sf-mono" style={{ color: tc.down > 4 ? 'var(--sf-danger)' : 'var(--sf-muted)', fontWeight: 700, fontSize: 12 }}>↓{tc.down}</span></td>
              <td align="center"><Pill tone={tc.r >= 4.5 ? 'success' : tc.r >= 4 ? 'warn' : 'danger'}>★ {tc.r}</Pill></td>
              <td align="right"><Money uzs={tc.sal} /></td>
              <td align="center"><Pill tone={tc.st2 === 'active' ? 'success' : 'warn'} dot>{tc.st2 === 'active' ? t('status.active') : t('status.review')}</Pill></td>
            </tr>
          ))}
        </DataTable>
        <Pagination label={`${rows.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–${Math.min(safePage * PAGE_SIZE, rows.length)} ${t('common.of')} ${rows.length}`} page={safePage} pages={pageCount} onPage={setPage} />
      </Card>
    </>
  );
}
