import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, Pill, PageHeader, SfStar, SfAvatar } from '../components/primitives.jsx';
import { FilterBar } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { GROUPS } from '../data/seeds.js';

const BRANCH_NAMES = ['Yunusobod', 'Chilonzor', 'Mirobod', 'Sebzor'];

export function GroupsPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState(0);
  const { items: allGroups, add } = useCollection('groups', GROUPS, 'n');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allGroups;
    if (q) list = list.filter((g) => `${g.n} ${g.t}`.toLowerCase().includes(q));
    if (chip === 2) list = list.filter((g) => g.st >= g.cap * 0.9);
    if (chip === 3) list = list.filter((g) => g.st < g.cap);
    return list;
  }, [allGroups, query, chip]);

  const addGroup = () =>
    a.create({
      title: t('dash.newGroup'),
      fields: [
        { name: 'name', label: t('cols.group'), required: true, placeholder: 'Ingliz B2 · Intensiv' },
        { name: 'teacher', label: t('cols.teacher') },
        { name: 'cap', label: t('groups.chipFull'), type: 'number', placeholder: '20' },
        { name: 'fee', label: t('cols.amount'), type: 'number', placeholder: '600000' },
        { name: 'sch', label: t('schedule.lesson'), placeholder: 'Du/Se/Pa · 09:00' },
      ],
      onSubmit: (v) =>
        add({
          n: v.name,
          t: v.teacher || '—',
          b: ceo ? BRANCH_NAMES[0] : 'Yunusobod',
          st: 0,
          cap: Number(v.cap) || 20,
          att: 100,
          sch: v.sch || '—',
          fee: Number(v.fee) || 600000,
          tone: 'var(--sf-primary)',
        }),
    });

  const chips = [
    { l: t('common.all'), n: ceo ? 96 : 28, on: chip === 0 },
    { l: t('status.active'), icon: Icons.check, on: chip === 1 },
    { l: t('groups.chipFull'), n: 12, on: chip === 2 },
    { l: t('groups.chipFreeSeats'), n: 18, on: chip === 3 },
  ];

  return (
    <>
      <PageHeader
        eyebrow={ceo ? `96 ${t('shell.studentsWord')}` : t('roles.managerScope')}
        title={t('nav.groups')}
        sub={ceo ? t('groups.subCeo') : t('groups.subManager')}
        right={<Button kind="primary" onClick={addGroup}>{cloneElement(Icons.plus, { size: 14 })} {t('dash.newGroup')}</Button>}
      />
      <FilterBar
        search={query}
        onSearch={setQuery}
        searchPlaceholder={t('groups.searchPlaceholder')}
        chips={chips}
        onToggleChip={setChip}
      />
      <div className="ad-groups-grid">
        {groups.map((g) => (
          <Card key={g.n} pad={false} className="ad-group-card">
            <div className="ad-gc-head">
              <div className="ad-gc-mark" style={{ background: g.tone }}><SfStar size={18} color="#FFFCF5" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ad-gc-n">{g.n}</div>
                <div className="ad-gc-t"><SfAvatar name={g.t} size={15} /> {g.t}</div>
              </div>
              {ceo && <Pill>{g.b}</Pill>}
            </div>
            <div className="ad-gc-cap">
              <div className="ad-gc-cap-bar">
                <div style={{ width: `${(g.st / g.cap) * 100}%`, background: g.st / g.cap > 0.9 ? 'var(--sf-warn)' : 'var(--sf-success)' }} />
              </div>
              <span className="sf-mono ad-gc-cap-t">{g.st}/{g.cap}</span>
            </div>
            <div className="ad-gc-meta">
              <div className="ad-gc-meta-i">{cloneElement(Icons.clock, { size: 12 })} {g.sch}</div>
              <div className="ad-gc-meta-i"><span className="sf-mono" style={{ color: g.att >= 92 ? 'var(--sf-success)' : 'var(--sf-warn)', fontWeight: 700 }}>{g.att}%</span> {t('cols.attendance')}</div>
              <div className="ad-gc-meta-i">{cloneElement(Icons.trend, { size: 12 })} <Money uzs={g.fee} />{t('common.perMonth')}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
