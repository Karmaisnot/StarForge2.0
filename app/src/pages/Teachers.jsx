import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, FilterBar } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const BRANCH_NAMES = ['Yunusobod', 'Chilonzor', 'Mirobod', 'Sebzor'];

const TEACHERS = [
  { n: 'Nigora Karimova', role: 'Katta o‘qituvchi', b: 'Yunusobod', sub: 'Matematika', g: 3, st: 58, att: 94, up: 18, down: 4, r: 4.9, sal: 8400000, st2: 'active' },
  { n: 'Aziz Tursunov', role: 'O‘qituvchi', b: 'Chilonzor', sub: 'Ingliz tili', g: 4, st: 64, att: 92, up: 22, down: 2, r: 4.8, sal: 7800000, st2: 'active' },
  { n: 'Malika Yusupova', role: 'O‘qituvchi', b: 'Mirobod', sub: 'Fizika', g: 3, st: 42, att: 88, up: 12, down: 6, r: 4.5, sal: 7200000, st2: 'active' },
  { n: 'Bobur Aliyev', role: 'O‘qituvchi', b: 'Yunusobod', sub: 'Geometriya', g: 4, st: 56, att: 90, up: 15, down: 3, r: 4.6, sal: 7600000, st2: 'active' },
  { n: 'Sevara Olimova', role: 'Assistent', b: 'Yunusobod', sub: 'Matematika', g: 2, st: 28, att: 96, up: 8, down: 0, r: 4.7, sal: 4200000, st2: 'active' },
  { n: 'Jasur Rahimov', role: 'O‘qituvchi', b: 'Sebzor', sub: 'Kimyo', g: 3, st: 38, att: 82, up: 6, down: 8, r: 3.9, sal: 7000000, st2: 'review' },
];

export function TeachersPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const { items: teachers, add } = useCollection('teachers', TEACHERS, 'n');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = teachers;
    if (q) list = list.filter((tc) => `${tc.n} ${tc.sub}`.toLowerCase().includes(q));
    if (chip === 4) list = list.filter((tc) => tc.st2 === 'review');
    return list;
  }, [teachers, query, chip]);

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
    { l: t('common.all'), n: ceo ? 54 : 16, on: chip === 0 },
    { l: t('cols.teacher'), n: 38, on: chip === 1 },
    { l: t('permissions.roleAssistant'), n: 12, on: chip === 2 },
    { l: t('status.active'), icon: Icons.check, on: chip === 3 },
    { l: t('teachers.kpiReview'), n: 2, icon: Icons.flag, on: chip === 4 },
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
            <Button kind="primary" onClick={addStaff}>{cloneElement(Icons.plus, { size: 14 })} {t('teachers.addStaff')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Kpi label={t('teachers.kpiTotal')} value={ceo ? '54' : '16'} icon={Icons.user} />
        <Kpi label={t('teachers.kpiRating')} value="4.6" accent="var(--sf-accent)" sub={t('teachers.ratingSub')} icon={Icons.star} />
        <Kpi label={t('teachers.kpiFund')} money={ceo ? 412000000 : 96000000} accent="var(--sf-success)" icon={Icons.trend} />
        <Kpi label={t('teachers.kpiReview')} value="2" accent="var(--sf-warn)" sub={t('teachers.reviewSub')} />
      </div>
      <FilterBar search={query} onSearch={setQuery} searchPlaceholder={t('teachers.searchPlaceholder')} chips={chips} onToggleChip={setChip} />
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.staffMember') }, { label: t('cols.subject') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.group'), align: 'right' }, { label: t('teachers.colStudents'), align: 'right' }, { label: t('cols.attendance'), align: 'right' },
          { label: t('cols.cards'), align: 'center' }, { label: t('cols.rating'), align: 'center' }, { label: t('cols.salary'), align: 'right' }, { label: t('cols.status'), align: 'center' },
        ]}>
          {rows.map((tc) => (
            <tr key={tc.n} onClick={() => a.open(tc.n)}>
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
      </Card>
    </>
  );
}
