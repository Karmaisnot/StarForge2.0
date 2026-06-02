import { cloneElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Card, Pill, PageHeader, SfAiBadge } from '../components/primitives.jsx';
import { useActions } from '../hooks/useActions.jsx';

export function AiPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [draft, setDraft] = useState('');

  const insights = [
    { tone: 'danger', tag: t('ai.tagChurn'), q: ceo ? t('ai.churnCeo') : t('ai.churnManager'), level: t('status.high'), acts: [t('ai.actCause'), t('ai.actTeacherStability'), t('ai.actActionPlan')] },
    { tone: 'success', tag: t('ai.tagGrowth'), q: ceo ? t('ai.growthCeo') : t('ai.growthManager'), level: t('status.opportunity'), acts: [t('ai.actDemand'), t('ai.actChooseTeacher')] },
    { tone: 'warn', tag: t('ai.tagFinance'), q: ceo ? t('ai.financeCeo') : t('ai.financeManager'), level: t('status.mid'), acts: [t('ai.actSendReminder'), t('ai.actPaymentPlan')] },
  ];
  const prompts = [t('ai.promptChurn'), t('ai.promptForecast'), t('ai.promptRating'), t('ai.promptCompare')];

  const send = () => {
    if (draft.trim()) {
      a.send();
      setDraft('');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t('messages.eyebrow')}
        title={<>{t('ai.titlePlain')} <span style={{ fontFamily: 'var(--sf-font-display)', fontStyle: 'italic', fontWeight: 400 }}>{t('ai.titleItalic')}</span></>}
        sub={ceo ? t('ai.subCeo') : t('ai.subManager')}
        right={<div className="ad-ai-meter"><SfAiBadge compact>{t('ai.limit')}</SfAiBadge><div className="ad-ai-meter-bar"><div style={{ width: '14%' }} /></div><span className="sf-mono" style={{ fontSize: 11, color: 'var(--sf-muted)' }}>14k/100k</span></div>}
      />
      <div className="ad-ai-layout">
        <div className="ad-ai-insights">
          {insights.map((ins, i) => (
            <div key={i} className="ad-ai-insight">
              <div className="ad-ai-insight-head">
                <SfAiBadge>{ins.tag}</SfAiBadge>
                <Pill tone={ins.tone} dot>{ins.level}</Pill>
              </div>
              <div className="ad-ai-insight-q">“{ins.q}”</div>
              <div className="ad-ai-insight-acts">
                {ins.acts.map((act) => <button key={act} className="ad-pill ad-pill-ai" style={{ cursor: 'pointer', border: 0 }} onClick={() => a.open(act)}>{act}</button>)}
              </div>
            </div>
          ))}
        </div>
        <Card title={t('ai.chatTitle')} pad={false} className="ad-ai-chatbox">
          <div className="ad-ai-cb-body">
            <div className="ad-cmsg out"><div className="ad-cbub out">{ceo ? 'Qaysi filial eng tez o‘smoqda va nega?' : 'Bu oy qaysi guruhlar to‘lib qoldi?'}</div></div>
            <div className="ad-cmsg in"><div className="ad-ai-mini2">Ai</div><div className="ad-cbub in">
              <span style={{ fontFamily: 'var(--sf-font-display)', fontStyle: 'italic', fontSize: 15 }}>{ceo ? 'Yunusobod' : '3 ta guruh'}.</span> {ceo ? 'Bu oy +5.2% o‘sish — asosan Ingliz B2 va matematika yo‘nalishlari hisobiga.' : 'Ingliz B2, 9-B Algebra va Algebra Mid 90%+ to‘lgan.'}
              <div className="ad-ai-cb-chips"><button className="ad-pill ad-pill-ai" style={{ cursor: 'pointer', border: 0 }} onClick={a.report}>{t('common.report')}</button></div>
            </div></div>
          </div>
          <div className="ad-ai-cb-prompts">
            {prompts.map((p) => <button key={p} onClick={() => { setDraft(p); }}>{p}</button>)}
          </div>
          <div className="ad-ai-cb-input">
            <input
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: 'var(--sf-ink)' }}
              placeholder={t('ai.inputPlaceholder')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="ad-ai-send" onClick={send}>{cloneElement(Icons.send, { size: 15 })}</button>
          </div>
        </Card>
      </div>
    </>
  );
}
