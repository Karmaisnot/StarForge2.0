import { cloneElement, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Card, Pill, PageHeader, SfStar, SfAvatar } from '../components/primitives.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';

const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const THREADS = [
  { n: 'Nigora Karimova', g: 'O‘qituvchi · Matematika', last: 'Ertangi yig‘ilishga tayyorman', tm: '14:42', un: 0, on: true, cat: 'teachers' },
  { n: 'Matematika bo‘limi', g: 'Guruh · 12 a‘zo', last: 'Siz: Yangi mavzular ro‘yxati...', tm: '13:20', un: 0, grp: true, cat: 'staff' },
  { n: 'Akbarova Dilnoza', g: 'Ota-ona · Akmal · 9-B', last: 'Rahmat ustoz!', tm: '12:18', un: 2, cat: 'parents' },
  { n: 'Aziz Tursunov', g: 'O‘qituvchi · Ingliz', last: 'Yangi guruh ochsak bo‘ladimi?', tm: '11:05', un: 1, on: true, cat: 'teachers' },
  { n: 'Halimova Zilola', g: 'O‘quvchi · 9-B', last: 'Uy ishini yubordim', tm: 'Du', un: 0, cat: 'students' },
  { n: 'Qabul bo‘limi', g: 'Guruh · 8 a‘zo', last: 'Bugun 6 ta yangi lid', tm: 'Du', un: 3, grp: true, cat: 'staff' },
  { n: 'Eshmatova Gulnora', g: 'Ota-ona · Otabek', last: 'To‘lov haqida savol', tm: 'Du', un: 0, cat: 'parents', flag: true },
];

export function MessagesPage() {
  const { t } = useTranslation();
  const { push } = useToast();
  const a = useActions();
  const [tab, setTab] = useState('all');
  const [sel, setSel] = useState(0);
  const [mode, setMode] = useState('msg');
  const [draft, setDraft] = useState('');
  const [log, setLog] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const fileRef = useRef(null);
  const { items: threads, add, update } = useCollection('messages', THREADS, 'n');

  const tabs = [
    ['all', t('messages.tabAll'), 92], ['staff', t('messages.tabStaff'), 24],
    ['teachers', t('messages.tabTeachers'), 16], ['parents', t('messages.tabParents'), 38], ['students', t('messages.tabStudents'), 14],
  ];
  const filtered = useMemo(() => (tab === 'all' ? threads : threads.filter((th) => th.cat === tab)), [threads, tab]);
  const cur = filtered[sel] || filtered[0] || threads[0];

  // Visible conversation = seeded opener + anything sent this session, narrowed
  // live by the in-thread search field.
  const baseMsgs = [
    { dir: 'in', text: `Assalomu alaykum! ${cur.grp ? 'Guruhga xush kelibsiz.' : 'Sizga bir savol bor edi.'}`, tm: '13:40' },
    { dir: 'out', text: 'Va alaykum assalom! Albatta, eshitaman.', tm: '13:42' },
    { dir: 'in', text: cur.last, tm: cur.tm },
    ...log.filter((m) => m.to === cur.n).map((m) => ({ dir: 'out', text: m.text, tm: m.tm })),
  ];
  const chatQ = chatQuery.trim().toLowerCase();
  const shownMsgs = chatQ ? baseMsgs.filter((m) => (m.text || '').toLowerCase().includes(chatQ)) : baseMsgs;

  const send = () => {
    if (!draft.trim() || !cur) return;
    const tm = nowHM();
    if (mode !== 'task') {
      setLog((l) => [...l, { to: cur.n, text: draft, tm }]);
      update(cur.n, { last: `Siz: ${draft}`, tm });
    }
    push({ tone: 'success', title: mode === 'task' ? t('toast.taskAssigned') : t('toast.messageSent'), desc: cur.n });
    setDraft('');
  };

  // Attach a real file → posts it into the thread and notifies.
  const onAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file || !cur) return;
    const tm = nowHM();
    setLog((l) => [...l, { to: cur.n, text: `📎 ${file.name}`, tm }]);
    update(cur.n, { last: `Siz: 📎 ${file.name}`, tm });
    push({ tone: 'success', title: t('toast.sent'), desc: file.name });
    e.target.value = '';
  };

  const showInfo = () =>
    a.open(cur.n, {
      icon: Icons.user,
      title: cur.n,
      sub: cur.g,
      rows: [
        [t('messages.profile'), cur.g],
        [t('cols.status'), cur.on ? t('common.online') : t('status.no')],
      ],
    });

  const newChat = () =>
    a.create({
      title: t('messages.newChat'),
      fields: [
        { name: 'name', label: t('messages.tfTo'), required: true, placeholder: t('ui.fNamePh') },
        {
          name: 'cat',
          label: t('cols.module'),
          type: 'select',
          options: [
            { value: 'teachers', label: t('messages.tabTeachers') },
            { value: 'parents', label: t('messages.tabParents') },
            { value: 'students', label: t('messages.tabStudents') },
            { value: 'staff', label: t('messages.tabStaff') },
          ],
        },
      ],
      onSubmit: (v) => { add({ n: v.name, g: '—', last: '', tm: nowHM(), un: 0, cat: v.cat || 'staff' }); setTab('all'); setSel(0); },
    });

  const quickActions = [
    [t('messages.qaTask'), Icons.check, 'var(--sf-primary)', a.task],
    [t('messages.qaMeeting'), Icons.cal, 'var(--sf-accent)', () => a.open(t('messages.qaMeeting'))],
    [t('messages.qaBroadcast'), Icons.bell, 'var(--sf-warn)', a.send],
    [t('messages.qaDept'), Icons.folder, 'var(--sf-success)', a.send],
  ];

  return (
    <>
      <PageHeader
        eyebrow={t('messages.eyebrow')}
        title={t('messages.title')}
        sub={t('messages.sub')}
        right={<button className="ad-btn ad-btn-primary" onClick={newChat}>{cloneElement(Icons.edit, { size: 14 })} {t('messages.newChat')}</button>}
      />
      <div className="og2-msg-layout">
        <Card pad={false} className="og2-threads">
          <div className="og2-tabs">
            {tabs.map(([id, l, n]) => (
              <button key={id} className={'og2-tab' + (tab === id ? ' on' : '')} onClick={() => { setTab(id); setSel(0); }}>{l}<span className="og2-tab-n">{n}</span></button>
            ))}
          </div>
          <div className="og2-thread-list">
            {filtered.map((th, i) => (
              <div key={th.n} className={'og2-thread' + (cur === th ? ' on' : '')} onClick={() => setSel(i)}>
                <div style={{ position: 'relative' }}>
                  {th.grp ? <div className="og2-grp-av" style={{ background: 'var(--sf-primary)' }}><SfStar size={18} color="#fff" /></div> : <SfAvatar name={th.n} size={40} />}
                  {th.on && <span className="og2-on-dot" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: th.un ? 700 : 600, display: 'flex', alignItems: 'center', gap: 5 }}>{th.n}{th.flag && cloneElement(Icons.flag, { size: 11, style: { color: 'var(--sf-danger)' } })}</span>
                    <span className="sf-mono" style={{ fontSize: 9.5, color: 'var(--sf-muted)' }}>{th.tm}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--sf-muted)' }}>{th.g}</div>
                  <div style={{ fontSize: 11.5, color: th.un ? 'var(--sf-ink-2)' : 'var(--sf-muted)', fontWeight: th.un ? 600 : 400, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{th.last}</div>
                </div>
                {th.un > 0 && <span className="og2-un">{th.un}</span>}
              </div>
            ))}
          </div>
        </Card>

        <div className="og2-chat">
          <div className="og2-chat-h">
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              {cur.grp ? <div className="og2-grp-av" style={{ background: 'var(--sf-primary)', width: 38, height: 38 }}><SfStar size={17} color="#fff" /></div> : <SfAvatar name={cur.n} size={38} />}
              <div><div style={{ fontSize: 14, fontWeight: 700 }}>{cur.n}</div><div style={{ fontSize: 11, color: cur.on ? 'var(--sf-success)' : 'var(--sf-muted)' }}>{cur.on ? '● ' + t('common.online') : cur.g}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {showSearch && (
                <input
                  autoFocus
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder={t('common.search')}
                  style={{ border: '1px solid var(--sf-border)', borderRadius: 8, padding: '5px 9px', outline: 'none', fontFamily: 'inherit', fontSize: 12, color: 'var(--sf-ink)', background: 'var(--sf-surface)', width: 150 }}
                />
              )}
              <button className="ad-mini-btn" style={{ color: showSearch ? 'var(--sf-primary)' : 'var(--sf-muted)' }} onClick={() => { setShowSearch((s) => !s); setChatQuery(''); }}>{cloneElement(Icons.search, { size: 15 })}</button>
              <button className="ad-mini-btn" style={{ color: 'var(--sf-muted)' }} onClick={showInfo}>{cloneElement(Icons.more, { size: 15 })}</button>
            </div>
          </div>
          <div className="og2-chat-body">
            <div className="og2-day">{t('common.today')}</div>
            {shownMsgs.map((m, i) => (
              <div key={i} className={'og2-m ' + m.dir}><div className={'og2-b ' + m.dir}>{m.text}<div className="og2-bt" style={m.dir === 'out' ? { color: 'rgba(255,252,245,0.7)' } : undefined}>{m.tm}</div></div></div>
            ))}
            {chatQ && shownMsgs.length === 0 && <div className="og2-day" style={{ color: 'var(--sf-muted)' }}>—</div>}
          </div>
          <div className="og2-composer">
            <div className="og2-mode">
              <button className={mode === 'msg' ? 'on' : ''} onClick={() => setMode('msg')}>{cloneElement(Icons.chat, { size: 13 })} {t('messages.modeMsg')}</button>
              <button className={mode === 'task' ? 'on' : ''} onClick={() => setMode('task')}>{cloneElement(Icons.check, { size: 13 })} {t('messages.modeTask')}</button>
            </div>
            {mode === 'task' && (
              <div className="og2-task-fields">
                <div className="og2-tf"><span className="og2-tf-l">{t('messages.tfTo')}</span><span className="og2-tf-v">{cur.n}</span></div>
                <div className="og2-tf"><span className="og2-tf-l">{t('messages.tfDue')}</span><span className="og2-tf-v sf-mono">22.05 · 18:00</span></div>
                <div className="og2-tf"><span className="og2-tf-l">{t('messages.tfPriority')}</span><span className="og2-tf-v" style={{ color: 'var(--sf-danger)' }}>P1 ●</span></div>
              </div>
            )}
            <div className="og2-input-row">
              <input ref={fileRef} type="file" hidden onChange={onAttach} />
              <button className="ad-mini-btn" style={{ color: 'var(--sf-muted)' }} onClick={() => fileRef.current?.click()}>{cloneElement(Icons.attach, { size: 16 })}</button>
              <input
                className="og2-text"
                style={{ border: 'none', outline: 'none', color: 'var(--sf-ink)', fontFamily: 'inherit' }}
                placeholder={mode === 'task' ? t('messages.taskPlaceholder') : t('messages.msgPlaceholder')}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="og2-send" style={{ background: mode === 'task' ? 'var(--sf-ink)' : 'var(--sf-primary)' }} onClick={send}>{cloneElement(mode === 'task' ? Icons.check : Icons.send, { size: 16 })}</button>
            </div>
          </div>
        </div>

        <div className="og2-ctx">
          <Card title={t('messages.quickActions')} pad={false}>
            {quickActions.map(([label, icon, color, handler], i, arr) => (
              <div key={i} className="og2-action" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--sf-border)' : 'none' }} onClick={handler}>
                <div className="og2-action-ic" style={{ background: color + '22', color }}>{cloneElement(icon, { size: 15 })}</div>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{label}</span>
                {cloneElement(Icons.chevR, { size: 14, style: { color: 'var(--sf-muted)' } })}
              </div>
            ))}
          </Card>
          <Card title={t('messages.profile')} style={{ marginTop: 14 }}>
            <div style={{ textAlign: 'center', padding: '4px 0' }}>
              {cur.grp ? <div className="og2-grp-av" style={{ background: 'var(--sf-primary)', width: 56, height: 56, margin: '0 auto' }}><SfStar size={26} color="#fff" /></div> : <SfAvatar name={cur.n} size={56} />}
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>{cur.n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sf-muted)' }}>{cur.g}</div>
              {!cur.grp && <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}><Pill tone="primary">{t('messages.profileBtn')}</Pill><Pill tone="success">{t('messages.historyBtn')}</Pill></div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
