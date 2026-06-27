import { cloneElement, Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, PageHeader } from '../components/primitives.jsx';
import { Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const ROOMS = ['301', '302', '304', '305', '210'];
const SLOTS = ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'];

// Week view spreads the room schedule across teaching days (Mon–Sat). Each
// lesson maps to a stable weekday by hashing its key, so the board is populated
// and deterministic without per-lesson date data.
const WEEKDAYS = [1, 2, 3, 4, 5, 6];
const lessonDay = (l) => ([...l.key].reduce((a, c) => a + c.charCodeAt(0), 0) % 6) + 1;

export function SchedulePage() {
  const { t } = useTranslation();
  const a = useActions();
  const [view, setView] = useState('day');
  const { items: lessons, add } = useCollection('schedule');
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
        {view === 'week' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: 12 }}>
            {WEEKDAYS.map((wd) => (
              <div key={wd} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sf-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', paddingBottom: 6, borderBottom: '1px solid var(--sf-border)' }}>{t('common.wd' + wd)}</div>
                {lessons.filter((l) => lessonDay(l) === wd).map((l) => (
                  <button key={l.key} onClick={() => a.open(l.n, { title: l.n, sub: l.t, icon: Icons.cal, rows: [[t('cols.teacher'), l.t], [t('schedule.room'), l.key.split('-')[0]], [t('cols.date'), l.key.split('-')[1]]] })} style={{ textAlign: 'left', background: l.c, color: '#FFFCF5', border: 'none', borderRadius: 8, padding: '7px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="sf-mono" style={{ fontSize: 9.5, opacity: 0.85 }}>{l.key.split('-')[1]} · {l.key.split('-')[0]}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>{l.n}</span>
                    <span style={{ fontSize: 10, opacity: 0.85 }}>{l.t}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
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
                      <div className="ad-sched-lesson" style={{ background: l.c, cursor: 'pointer' }} onClick={() => a.open(l.n, { title: l.n, sub: l.t, icon: Icons.cal, rows: [[t('cols.teacher'), l.t], [t('schedule.room'), l.key.split('-')[0]], [t('cols.date'), l.key.split('-')[1]]] })}>
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
        )}
      </Card>
    </>
  );
}
