import { cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Card, Pill, PageHeader, SfAiBadge } from '../components/primitives.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useScope } from '../context/ScopeContext.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { studentMetrics, teacherMetrics, branchMetrics, paymentMetrics } from '../lib/metrics.js';
import { fmtMoney } from '../lib/format.js';

export function AiPage({ role }) {
  const { t } = useTranslation();
  const a = useActions();
  const ceo = role === 'ceo';
  const [draft, setDraft] = useState('');
  const { scopeBranch } = useScope();
  const { items: students } = useCollection('students');
  const { items: teachers } = useCollection('teachers');
  const { items: branches } = useCollection('branches');
  const { items: payments } = useCollection('payments');

  const sm = useMemo(() => studentMetrics(scopeBranch(students)), [scopeBranch, students]);
  const tm = useMemo(() => teacherMetrics(scopeBranch(teachers)), [scopeBranch, teachers]);
  const bm = useMemo(() => branchMetrics(scopeBranch(branches)), [scopeBranch, branches]);
  const pm = useMemo(() => paymentMetrics(scopeBranch(payments)), [scopeBranch, payments]);

  const reply = (q) => {
    const s = q.toLowerCase();
    if (/churn|xavf|отток|risk/.test(s)) return t('ai.replyChurn', { risk: sm.risk, debt: sm.debtors });
    if (/daromad|revenue|доход|pul|to['‘]?lov|pay/.test(s)) return t('ai.replyRevenue', { rev: fmtMoney(bm.revenue, 'UZS'), rate: pm.payRate, check: fmtMoney(pm.avgCheck, 'UZS') });
    if (/o['‘]?quvchi|student|ученик/.test(s)) return t('ai.replyStudents', { total: sm.total, active: sm.active, att: sm.avgAtt });
    return t('ai.replyDefault', { total: sm.total, teachers: tm.total, rev: fmtMoney(bm.revenue, 'UZS') });
  };

  const [log, setLog] = useState([
    { role: 'user', text: ceo ? 'Qaysi filial eng tez o‘smoqda va nega?' : 'Bu oy qaysi guruhlar to‘lib qoldi?' },
    { role: 'ai', text: ceo ? 'Yunusobod. Bu oy +5.2% o‘sish — asosan Ingliz B2 va matematika yo‘nalishlari hisobiga.' : 'Ingliz B2, 9-B Algebra va Algebra Mid 90%+ to‘lgan.' },
  ]);

  const insights = [
    { tone: 'danger', tag: t('ai.tagChurn'), q: ceo ? t('ai.churnCeo') : t('ai.churnManager'), level: t('status.high'), acts: [t('ai.actCause'), t('ai.actTeacherStability'), t('ai.actActionPlan')] },
    { tone: 'success', tag: t('ai.tagGrowth'), q: ceo ? t('ai.growthCeo') : t('ai.growthManager'), level: t('status.opportunity'), acts: [t('ai.actDemand'), t('ai.actChooseTeacher')] },
    { tone: 'warn', tag: t('ai.tagFinance'), q: ceo ? t('ai.financeCeo') : t('ai.financeManager'), level: t('status.mid'), acts: [t('ai.actSendReminder'), t('ai.actPaymentPlan')] },
  ];
  const prompts = [t('ai.promptChurn'), t('ai.promptForecast'), t('ai.promptRating'), t('ai.promptCompare')];

  const ask = (text) => {
    const q = text.trim();
    if (!q) return;
    setLog((prev) => [...prev, { role: 'user', text: q }, { role: 'ai', text: reply(q) }]);
    setDraft('');
  };
  const send = () => ask(draft);

  const openInsight = (act, ins) =>
    a.open(act, {
      title: act,
      sub: ins.tag,
      rows: [
        [t('students.kpiRisk'), String(sm.risk)],
        [t('students.kpiDebt'), String(sm.debtors)],
        [t('cols.attendance'), sm.avgAtt + '%'],
      ],
    });

  const report = () =>
    a.report({
      title: t('ai.chatTitle'),
      subtitle: ceo ? t('ai.subCeo') : t('ai.subManager'),
      sections: [
        { heading: t('nav.students'), rows: [
          [t('students.kpiTotal'), String(sm.total)],
          [t('students.kpiActive'), String(sm.active)],
          [t('students.kpiRisk'), String(sm.risk)],
          [t('students.kpiDebt'), String(sm.debtors)],
          [t('cols.attendance'), sm.avgAtt + '%'],
        ] },
        { heading: t('nav.teachers'), rows: [
          [t('students.kpiTotal'), String(tm.total)],
        ] },
        { heading: t('ai.tagFinance'), rows: [
          [t('ai.tagFinance'), fmtMoney(bm.revenue, 'UZS')],
          [t('cols.payment'), pm.payRate + '%'],
        ] },
      ],
    });

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
                {ins.acts.map((act) => <button key={act} className="ad-pill ad-pill-ai" style={{ cursor: 'pointer', border: 0 }} onClick={() => openInsight(act, ins)}>{act}</button>)}
              </div>
            </div>
          ))}
        </div>
        <Card title={t('ai.chatTitle')} pad={false} className="ad-ai-chatbox">
          <div className="ad-ai-cb-body">
            {log.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} className="ad-cmsg out"><div className="ad-cbub out">{m.text}</div></div>
              ) : (
                <div key={i} className="ad-cmsg in"><div className="ad-ai-mini2">Ai</div><div className="ad-cbub in">
                  {m.text}
                  <div className="ad-ai-cb-chips"><button className="ad-pill ad-pill-ai" style={{ cursor: 'pointer', border: 0 }} onClick={report}>{t('common.report')}</button></div>
                </div></div>
              )
            ))}
          </div>
          <div className="ad-ai-cb-prompts">
            {prompts.map((p) => <button key={p} onClick={() => ask(p)}>{p}</button>)}
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
