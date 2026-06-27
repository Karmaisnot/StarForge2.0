import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SectionHeader, SfAvatar } from '../components/primitives.jsx';
import { Kpi } from '../components/charts.jsx';
import { DataTable, Pagination, Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { useScope } from '../context/ScopeContext.jsx';
import { BRANCH_NAMES } from '../data/dataset.js';
import { hrMetrics } from '../lib/metrics.js';
import { fmtMoney } from '../lib/format.js';

export function HRPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [seg, setSeg] = useState('all');
  const [page, setPage] = useState(1);
  const { scopeBranch } = useScope();
  const { items: employees, add } = useCollection('hr');
  const base = useMemo(() => scopeBranch(employees), [scopeBranch, employees]);
  const m = useMemo(() => hrMetrics(base), [base]);

  // all / teacher / admin segment — split by teaching vs administrative dept.
  const TEACHING_DEPTS = ['Matematika', 'Ingliz tili', 'Tabiiy fanlar'];
  const shown = seg === 'all' ? base : base.filter((e) => TEACHING_DEPTS.includes(e.dept) === (seg === 'teacher'));

  const PAGE_SIZE = 8;
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const createStaff = () =>
    a.create({
      title: t('hr.createStaff'),
      fields: [
        { name: 'name', label: t('cols.staffMember'), required: true, placeholder: t('ui.fNamePh') },
        { name: 'pos', label: t('cols.position'), placeholder: 'O‘qituvchi' },
        { name: 'dept', label: t('cols.department'), placeholder: 'Matematika' },
        ...(ceo ? [{ name: 'branch', label: t('cols.branch'), type: 'select', options: BRANCH_NAMES }] : []),
        { name: 'sal', label: t('cols.salary'), type: 'number', placeholder: '7000000' },
      ],
      onSubmit: (v) =>
        add({
          n: v.name,
          pos: v.pos || 'O‘qituvchi',
          dept: v.dept || '—',
          b: ceo ? v.branch || BRANCH_NAMES[0] : 'Yunusobod',
          type: 'full',
          sal: Number(v.sal) || 7000000,
          since: String(new Date().getFullYear()),
          st: 'active',
        }),
    });

  const pipeline = [
    { id: 'applied', l: t('hr.colApplied'), c: 'var(--sf-primary)', cands: [{ n: 'Olimjon Rashidov', pos: 'Matematika o‘qit.', tm: '2 soat' }, { n: 'Dilnoza Aliyeva', pos: 'Assistent', tm: '5 soat' }, { n: 'Sherzod Karimov', pos: 'Reception', tm: '1 kun' }] },
    { id: 'interview', l: t('hr.colInterview'), c: 'var(--sf-accent)', cands: [{ n: 'Madina Tosheva', pos: 'Ingliz o‘qit.', tm: 'Ertaga 14:00' }, { n: 'Jasur Nazarov', pos: 'Marketing', tm: '23 May' }] },
    { id: 'trial', l: t('hr.colTrial'), c: 'var(--sf-warn)', cands: [{ n: 'Nilufar Yusupova', pos: 'Matematika o‘qit.', tm: '24 May' }] },
    { id: 'offer', l: t('hr.colOffer'), c: 'var(--sf-success)', cands: [{ n: 'Bekzod Aliyev', pos: 'Fizika o‘qit.', tm: 'Yuborildi' }] },
  ];
  const typeLabel = { full: t('settings.valFull'), half: t('status.partial'), hourly: t('settings.val8h') };
  const typeTone = { full: 'success', half: 'warn', hourly: 'neutral' };
  const vacancy = pipeline.reduce((s, col) => s + col.cands.length, 0);

  const openEmployee = (e) =>
    a.open(e.n, {
      title: e.n,
      sub: e.pos,
      icon: Icons.user,
      rows: [
        [t('cols.position'), e.pos],
        [t('cols.department'), e.dept],
        [t('cols.branch'), e.b],
        [t('cols.contract'), typeLabel[e.type]],
        [t('cols.tenure'), e.since],
        [t('cols.salary'), fmtMoney(e.sal, 'UZS')],
        [t('cols.status'), e.st === 'active' ? t('status.active') : t('status.leave')],
      ],
    });

  const openCandidate = (c) =>
    a.open(c.n, { title: c.n, sub: c.pos, icon: Icons.user, rows: [[t('cols.position'), c.pos], [t('cols.date'), c.tm]] });

  const openAllCandidates = () =>
    a.open(t('hr.allCandidates'), {
      title: t('hr.allCandidates'),
      sub: t('hr.recruiting'),
      icon: Icons.user,
      rows: pipeline.flatMap((col) => col.cands.map((c) => [`${c.n} · ${c.pos}`, `${col.l} · ${c.tm}`])),
    });

  return (
    <>
      <PageHeader
        eyebrow={ceo ? t('hr.eyebrowCeo') : t('hr.eyebrowManager')}
        title={t('hr.title')}
        sub={t('hr.sub')}
        right={
          <>
            <Button
              kind="soft"
              onClick={() => a.exportData({
                name: t('hr.title'),
                columns: [
                  { key: 'n', label: t('cols.staffMember') },
                  { key: 'pos', label: t('cols.position') },
                  { key: 'dept', label: t('cols.department') },
                  { key: 'b', label: t('cols.branch') },
                  { label: t('cols.contract'), value: (e) => typeLabel[e.type] },
                  { key: 'since', label: t('cols.tenure') },
                  { key: 'sal', label: t('cols.salary') },
                  { label: t('cols.status'), value: (e) => (e.st === 'active' ? t('status.active') : t('status.leave')) },
                ],
                rows: shown,
                allRows: base,
              })}
            >{cloneElement(Icons.download, { size: 14 })} {t('common.export')}</Button>
            <Button kind="primary" onClick={createStaff}>{cloneElement(Icons.plus, { size: 14 })} {t('hr.createStaff')}</Button>
          </>
        }
      />
      <div className="ad-kpi-grid">
        <Kpi label={t('hr.kpiTotal')} value={String(m.total)} icon={Icons.user} trend={{ up: true, v: '4' }} />
        <Kpi label={t('hr.kpiVacancy')} value={String(vacancy)} accent="var(--sf-warn)" sub={t('hr.vacancySub')} icon={Icons.flag} />
        <Kpi label={t('hr.kpiFund')} money={m.fund} accent="var(--sf-success)" />
        <Kpi label={t('hr.kpiTenure')} value={`${m.avgTenure} yil`} />
        <Kpi label={t('hr.kpiOnLeave')} value={String(m.onLeave)} accent="var(--sf-primary)" />
      </div>
      <SectionHeader action={<a className="ad-link" onClick={openAllCandidates}>{t('hr.allCandidates')} ›</a>}>{t('hr.recruiting')}</SectionHeader>
      <div className="ad-kanban" style={{ marginBottom: 18 }}>
        {pipeline.map((col) => (
          <div key={col.id} className="ad-kcol">
            <div className="ad-kcol-h"><span className="ad-kdot" style={{ background: col.c }} /><span className="ad-kname">{col.l}</span><span className="ad-kcount">{col.cands.length}</span></div>
            <div className="ad-kcards">
              {col.cands.map((c, i) => (
                <div key={i} className="og-cand" onClick={() => openCandidate(c)}>
                  <div className="og-cand-rail" style={{ background: col.c }} />
                  <div style={{ flex: 1, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SfAvatar name={c.n} size={26} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>{c.n}</span></div>
                    <div style={{ marginTop: 7 }}><Pill tone="primary">{c.pos}</Pill></div>
                    <div className="sf-mono" style={{ marginTop: 7, fontSize: 10.5, color: 'var(--sf-muted)' }}>{c.tm}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SectionHeader action={<Segmented value={seg} onChange={(v) => { setSeg(v); setPage(1); }} options={[{ id: 'all', label: t('hr.segAll') }, { id: 'teacher', label: t('hr.segTeacher') }, { id: 'admin', label: t('hr.segAdmin') }]} />}>{t('hr.staffSection')} · {shown.length} / {m.total}</SectionHeader>
      <Card pad={false}>
        <DataTable cols={[
          { label: t('cols.staffMember') }, { label: t('cols.position') }, { label: t('cols.department') }, ...(ceo ? [{ label: t('cols.branch') }] : []),
          { label: t('cols.contract') }, { label: t('cols.tenure'), align: 'center' }, { label: t('cols.salary'), align: 'right' }, { label: t('cols.status'), align: 'center' },
        ]}>
          {pageRows.map((e) => (
            <tr key={e.n} onClick={() => openEmployee(e)}>
              <td><div className="ad-cell-u"><SfAvatar name={e.n} size={30} /><span style={{ fontWeight: 600 }}>{e.n}</span></div></td>
              <td style={{ fontSize: 12.5 }}>{e.pos}</td>
              <td style={{ fontSize: 12.5, color: 'var(--sf-muted)' }}>{e.dept}</td>
              {ceo && <td style={{ fontSize: 12.5, color: 'var(--sf-muted)' }}>{e.b}</td>}
              <td><Pill tone={typeTone[e.type]}>{typeLabel[e.type]}</Pill></td>
              <td align="center" className="sf-mono" style={{ fontSize: 12, color: 'var(--sf-muted)' }}>{e.since}</td>
              <td align="right"><Money uzs={e.sal} /></td>
              <td align="center"><Pill tone={e.st === 'active' ? 'success' : 'primary'} dot>{e.st === 'active' ? t('status.active') : t('status.leave')}</Pill></td>
            </tr>
          ))}
        </DataTable>
        <Pagination label={`${shown.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–${Math.min(safePage * PAGE_SIZE, shown.length)} ${t('common.of')} ${shown.length}`} page={safePage} pages={pageCount} onPage={setPage} />
      </Card>
    </>
  );
}
