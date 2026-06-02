import { cloneElement, Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, PageHeader } from '../components/primitives.jsx';
import { Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const ROOMS = ['301', '302', '304', '305', '210'];
const SLOTS = ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'];
const LESSONS = [
  { key: '301-08:00', n: 'Fizika', t: 'Malika Y.', c: 'var(--sf-accent)' },
  { key: '304-09:30', n: '9-B Alg', t: 'Nigora K.', c: 'var(--sf-primary)' },
  { key: '304-14:00', n: 'Alg Mid', t: 'Nigora K.', c: 'var(--sf-primary)' },
  { key: '302-11:00', n: 'Ingliz B2', t: 'Aziz T.', c: 'var(--sf-success)' },
  { key: '305-15:30', n: 'Geom', t: 'Bobur A.', c: 'var(--sf-ink-2)' },
  { key: '210-17:00', n: 'Kimyo', t: 'Jasur R.', c: 'var(--sf-warn)' },
  { key: '301-15:30', n: 'DTM', t: 'Malika Y.', c: 'var(--sf-accent)' },
];

export function SchedulePage() {
  const { t } = useTranslation();
  const a = useActions();
  const [view, setView] = useState('day');
  const { items: lessons, add } = useCollection('schedule', LESSONS, 'key');
  const byKey = useMemo(() => Object.fromEntries(lessons.map((l) => [l.key, l])), [lessons]);

  const addLesson = () =>
    a.create({
      title: t('schedule.lesson'),
      submitLabel: t('schedule.lesson'),
      fields: [
        { name: 'name', label: t('schedule.lesson'), required: true, placeholder: 'Ingliz B2' },
        { name: 'teacher', label: t('cols.teacher') },
        { name: 'room', label: t('schedule.room'), type: 'select', options: ROOMS },
        { name: 'slot', label: t('cols.date'), type: 'select', options: SLOTS },
      ],
      onSubmit: (v) => add({ key: `${v.room}-${v.slot}`, n: v.name, t: v.teacher || '—', c: 'var(--sf-primary)' }),
    });

  return (
    <>
      <PageHeader
        eyebrow={t('schedule.eyebrow')}
        title={t('schedule.title')}
        sub={t('schedule.sub')}
        right={
          <>
            <Segmented value={view} onChange={setView} options={[{ id: 'day', label: t('common.day') }, { id: 'week', label: t('common.week') }]} />
            <Button kind="primary" onClick={addLesson}>{cloneElement(Icons.plus, { size: 14 })} {t('schedule.lesson')}</Button>
          </>
        }
      />
      <Card pad={false}>
        <div className="ad-sched-grid" style={{ gridTemplateColumns: `64px repeat(${ROOMS.length}, 1fr)` }}>
          <div className="ad-sched-corner" />
          {ROOMS.map((r) => <div key={r} className="ad-sched-room">{t('schedule.room')} {r}</div>)}
          {SLOTS.map((slot) => (
            <Fragment key={slot}>
              <div className="ad-sched-time sf-mono">{slot}</div>
              {ROOMS.map((r) => {
                const l = byKey[`${r}-${slot}`];
                return (
                  <div key={r} className="ad-sched-cell">
                    {l && (
                      <div className="ad-sched-lesson" style={{ background: l.c, cursor: 'pointer' }} onClick={() => a.open(`${l.n} · ${l.t}`)}>
                        <div className="ad-sl-n">{l.n}</div>
                        <div className="ad-sl-t">{l.t}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </Card>
    </>
  );
}
