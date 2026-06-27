import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Card, Pill, PageHeader, SfAvatar } from '../components/primitives.jsx';
import { useActions } from '../hooks/useActions.jsx';

const THREADS = [
  { t: 'Nigora Karimova', p: 'Akbarova Dilnoza', sub: '9-B · Akmal', last: 'Rahmat, ustoz! Ertaga albatta...', tm: '14:42', flag: false },
  { t: 'Nigora Karimova', p: 'Eshmatova Gulnora', sub: '9-B · Otabek', last: 'Bolam bugun darsga kela olmaydi', tm: '12:18', flag: true },
  { t: 'Bobur Aliyev', p: 'Halimov Rustam', sub: '10-V · Zilola', last: 'Yaxshi, biz keldik', tm: 'Du', flag: false },
  { t: 'Aziz Tursunov', p: 'Davronov Temur', sub: 'Ingliz · Sevinch', last: 'To‘lov haqida savol bor edi', tm: 'Du', flag: false },
];

export function ChatsPage() {
  const { t } = useTranslation();
  const a = useActions();
  const [sel, setSel] = useState(0);
  const [query, setQuery] = useState('');
  const [threads, setThreads] = useState(THREADS);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? threads.filter((th) => `${th.t} ${th.p}`.toLowerCase().includes(q)) : threads;
  }, [threads, query]);
  const cur = list[sel] || list[0] || threads[0];

  const toggleFlag = () =>
    a.flag(`${cur.t} ↔ ${cur.p}`, {
      onConfirm: () =>
        setThreads((prev) => prev.map((th) => (th === cur ? { ...th, flag: !th.flag } : th))),
    });

  return (
    <>
      <PageHeader
        eyebrow={t('chats.eyebrow')}
        title={t('chats.title')}
        sub={t('chats.sub')}
        right={<Pill tone="ai">{cloneElement(Icons.shield, { size: 11 })} {t('common.auditMode')}</Pill>}
      />
      <div className="ad-chats-layout">
        <Card pad={false} className="ad-chats-list">
          <div className="ad-chatlist-search">
            {cloneElement(Icons.search, { size: 14, style: { color: 'var(--sf-muted)' } })}
            <input placeholder={t('chats.searchPlaceholder')} value={query} onChange={(e) => { setQuery(e.target.value); setSel(0); }} />
          </div>
          {list.map((th, i) => (
            <div key={i} className={'ad-chat-thread' + (cur === th ? ' on' : '')} onClick={() => setSel(i)}>
              <div className="ad-chat-avatars">
                <SfAvatar name={th.t} size={32} />
                <SfAvatar name={th.p} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{th.t.split(' ')[0]} ↔ {th.p.split(' ')[0]}</span>
                  {th.flag && <span style={{ color: 'var(--sf-danger)' }}>{cloneElement(Icons.flag, { size: 11 })}</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--sf-muted)' }}>{th.sub}</div>
                <div style={{ fontSize: 11, color: 'var(--sf-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{th.last}</div>
              </div>
              <span className="sf-mono" style={{ fontSize: 9.5, color: 'var(--sf-muted)' }}>{th.tm}</span>
            </div>
          ))}
        </Card>
        <Card pad={false} className="ad-chat-view">
          <div className="ad-chatv-head">
            <div className="ad-cell-u">
              <SfAvatar name={cur.t} size={36} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{cur.t} <span style={{ color: 'var(--sf-muted)', fontWeight: 400 }}>↔ {cur.p}</span></div>
                <div style={{ fontSize: 11, color: 'var(--sf-muted)' }}>{cur.sub} · {t('chats.headerSub')}</div>
              </div>
            </div>
            <Pill tone="ai">{cloneElement(Icons.shield, { size: 11 })} {t('common.readOnly')}</Pill>
          </div>
          <div className="ad-chatv-body">
            <div className="ad-cmsg in"><SfAvatar name={cur.p} size={24} /><div className="ad-cbub in">Assalomu alaykum, Nigora opa. Akmal bugun darsda nima yangilik qildi?<div className="ad-cbub-t">09:42</div></div></div>
            <div className="ad-cmsg out"><div className="ad-cbub out">Va alaykum assalom! Akmal bugun yaxshi ishladi — kvadrat tenglamani mustaqil yechib berdi.<div className="ad-cbub-t" style={{ color: 'rgba(255,252,245,0.7)' }}>09:48</div></div></div>
            <div className="ad-cmsg in"><SfAvatar name={cur.p} size={24} /><div className="ad-cbub in">{cur.last}<div className="ad-cbub-t">{cur.tm}</div></div></div>
          </div>
          <div className="ad-chatv-foot">
            {cloneElement(Icons.shield, { size: 14, style: { color: 'var(--sf-muted)' } })}
            <span>{t('chats.footNote')} {cur.flag && <b style={{ color: 'var(--sf-danger)' }}>{t('chats.flagged')}</b>}</span>
            <button className="ad-btn ad-btn-soft" style={{ marginLeft: 'auto' }} onClick={toggleFlag}>{cloneElement(Icons.flag, { size: 13 })} {t('chats.flag')}</button>
          </div>
        </Card>
      </div>
    </>
  );
}
