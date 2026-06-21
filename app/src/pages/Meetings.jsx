import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Card, Pill, PageHeader, SectionHeader, SfAvatar } from '../components/primitives.jsx';
import { Segmented } from '../components/common.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const MEETINGS = [
  { id: 'mt1', t: 'Haftalik filial yig‘ilishi', aud: 'Butun filial', cnt: 16, dNum: '19', d: 'today', tm: '17:00–18:00', loc: 'Konferens zal', who: 'Dilnoza Yo‘ldosheva', tone: 'var(--sf-primary)', soon: true, online: false },
  { id: 'mt2', t: 'Matematika bo‘limi · metodik', aud: 'Matematika bo‘limi', cnt: 12, dNum: '20', d: 'tomorrow', tm: '14:00–15:00', loc: 'Onlayn · Zoom', who: 'Nigora Karimova', tone: 'var(--sf-accent)', online: true },
  { id: 'mt3', t: 'Sotuv natijalari · oylik', aud: 'Sotuv · Marketing', cnt: 5, dNum: '23', d: 'date', tm: '11:00', loc: '301-xona', who: 'Rustam Olimov', tone: 'var(--sf-warn)', online: false },
  { id: 'mt4', t: 'Yangi o‘qituvchilar treningi', aud: 'Tanlangan · 6 kishi', cnt: 6, dNum: '24', d: 'date', tm: '10:00–13:00', loc: 'O‘quv zal', who: 'Malika Yusupova', tone: 'var(--sf-success)', online: false },
];

export function MeetingsPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const [aud, setAud] = useState(0);
  const [place, setPlace] = useState('hall');
  const [topic, setTopic] = useState('');
  const { items: meetings, add } = useCollection('meetings', MEETINGS, 'id');
  const [view, setView] = useState('list');

  // Map a May day-number to an ISO weekday (Mon=1…Sun=7); 19 May 2026 is a Tue.
  const meetWeekday = (dNum) => ((((Number(dNum) - 19 + 1) % 7) + 7) % 7) + 1;
  const openMeeting = (m) =>
    a.open(m.t, {
      icon: m.online ? Icons.video : Icons.cal,
      title: m.t,
      sub: `${m.dNum} May · ${m.tm}`,
      rows: [
        [t('meetings.participants'), `${m.aud} · ${m.cnt} ${t('meetings.people')}`],
        [t('meetings.timeLabel'), m.tm],
        [t('meetings.place'), m.loc],
      ],
    });

  const audiences = [
    [t('meetings.audWholeBranch'), Icons.globe],
    [t('meetings.audDept'), Icons.folder],
    [t('meetings.audSelected'), Icons.user],
    [t('meetings.audOtherBranch'), Icons.cohort],
  ];
  const placeLabel = { hall: t('meetings.placeHall'), online: t('meetings.placeOnline'), room: t('meetings.placeRoom') };

  const addMeeting = ({ title, tm, loc, online, audience }) =>
    add({
      id: `mt-${Date.now()}`,
      t: title,
      aud: audience,
      cnt: 16,
      dNum: String(new Date().getDate()),
      d: 'date',
      tm: tm || '17:00',
      loc,
      who: '—',
      tone: 'var(--sf-primary)',
      online,
      soon: false,
    });

  // Top-bar button: full form. Inline "quick meeting" panel: uses its own state.
  const scheduleMeeting = () =>
    a.create({
      title: t('meetings.schedule'),
      submitLabel: t('meetings.assignNotify'),
      fields: [
        { name: 'name', label: t('meetings.topic'), required: true, placeholder: t('meetings.topicPlaceholder') },
        { name: 'time', label: t('meetings.timeLabel'), placeholder: '17:00' },
        { name: 'loc', label: t('meetings.place'), placeholder: t('meetings.placeRoom') },
      ],
      onSubmit: (v) =>
        addMeeting({ title: v.name, tm: v.time, loc: v.loc || placeLabel.hall, online: false, audience: t('meetings.audWholeBranch') }),
    });

  const scheduleQuick = () => {
    addMeeting({
      title: topic.trim() || t('meetings.quick'),
      tm: '17:00',
      loc: placeLabel[place],
      online: place === 'online',
      audience: audiences[aud][0],
    });
    setTopic('');
  };

  return (
    <>
      <PageHeader
        eyebrow={role === 'ceo' ? t('roles.ceoScope') : t('roles.managerScope')}
        title={t('meetings.title')}
        sub={t('meetings.sub')}
        right={
          <>
            <Segmented value={view} onChange={setView} options={[{ id: 'list', label: t('common.list') }, { id: 'cal', label: t('common.calendar') }]} />
            <button className="ad-btn ad-btn-primary" onClick={scheduleMeeting}>{cloneElement(Icons.plus, { size: 14 })} {t('meetings.schedule')}</button>
          </>
        }
      />
      <div className="og2-meet-layout">
        <div>
          <SectionHeader>{t('meetings.upcoming')}</SectionHeader>
          {view === 'cal' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((wd) => (
                <div key={wd} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sf-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', paddingBottom: 4, borderBottom: '1px solid var(--sf-border)' }}>{t('common.wd' + wd)}</div>
                  {meetings.filter((m) => meetWeekday(m.dNum) === wd).map((m) => (
                    <button key={m.id} onClick={() => openMeeting(m)} style={{ textAlign: 'left', background: 'var(--sf-surface-2)', border: '1px solid var(--sf-border)', borderLeft: `3px solid ${m.tone}`, borderRadius: 8, padding: '7px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="sf-mono" style={{ fontSize: 10, color: 'var(--sf-muted)' }}>{m.dNum} May · {m.tm}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--sf-ink)' }}>{m.t}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meetings.map((m) => (
              <Card key={m.id} pad={false} className="og2-meet">
                <div className="og2-meet-date" style={{ background: m.tone }}>
                  <div className="og2-meet-d">{m.dNum}</div>
                  <div className="og2-meet-mon">May</div>
                </div>
                <div className="og2-meet-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="og2-meet-t">{m.t}</span>
                    {m.soon && <Pill tone="primary" dot>{t('common.today')}</Pill>}
                  </div>
                  <div className="og2-meet-meta">
                    <span>{cloneElement(Icons.clock, { size: 12 })} {m.tm}</span>
                    <span>{cloneElement(m.online ? Icons.video : Icons.pin, { size: 12 })} {m.loc}</span>
                  </div>
                  <div className="og2-meet-foot">
                    <span className="og2-meet-aud">{cloneElement(Icons.cohort, { size: 13 })} {m.aud} · {m.cnt} {t('meetings.people')}</span>
                    <div className="og2-avatars-sm">{[0, 1, 2].map((j) => <div key={j} className="og-av-wrap"><SfAvatar name={m.who + j} size={22} /></div>)}{m.cnt > 3 && <div className="og2-av-more-sm">+{m.cnt - 3}</div>}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>
        <div>
          <Card title={t('meetings.quick')}>
            <div className="og2-form">
              <label className="og2-label">{t('meetings.topic')}</label>
              <input className="og2-input" style={{ outline: 'none' }} placeholder={t('meetings.topicPlaceholder')} value={topic} onChange={(e) => setTopic(e.target.value)} />
              <label className="og2-label">{t('meetings.participants')}</label>
              <div className="og2-aud-grid">
                {audiences.map((aOpt, i) => (
                  <button key={i} className={'og2-aud' + (aud === i ? ' on' : '')} onClick={() => setAud(i)}>{cloneElement(aOpt[1], { size: 16 })}<span>{aOpt[0]}</span></button>
                ))}
              </div>
              <div className="og2-form-row">
                <div style={{ flex: 1 }}><label className="og2-label">{t('meetings.dateLabel')}</label><div className="og2-input sf-mono">20.05.2026</div></div>
                <div style={{ flex: 1 }}><label className="og2-label">{t('meetings.timeLabel')}</label><div className="og2-input sf-mono">17:00</div></div>
              </div>
              <label className="og2-label">{t('meetings.place')}</label>
              <div className="og2-seg2">
                {[['hall', t('meetings.placeHall')], ['online', t('meetings.placeOnline')], ['room', t('meetings.placeRoom')]].map(([id, l]) => (
                  <button key={id} className={place === id ? 'on' : ''} onClick={() => setPlace(id)}>{l}</button>
                ))}
              </div>
              <button className="ad-btn ad-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={scheduleQuick}>{cloneElement(Icons.bell, { size: 14 })} {t('meetings.assignNotify')}</button>
              <div className="og2-form-note">{t('meetings.notifyNote')}</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
