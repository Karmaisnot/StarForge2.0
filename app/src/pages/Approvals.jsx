import { cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '../components/Icons.jsx';
import { Button, Card, Money, PageHeader } from '../components/primitives.jsx';
import { useActions } from '../hooks/useActions.jsx';
import { useCollection } from '../context/StoreContext.jsx';
import { APPROVALS } from '../data/seeds.js';

const KIND_ICON = {
  refund: Icons.trend, salary: Icons.trend, buy: Icons.trend,
  leave: Icons.cal, group: Icons.brand, remove: Icons.x, discount: Icons.flag,
};

export function ApprovalsPage() {
  const { t } = useTranslation();
  const a = useActions();
  const { items, remove } = useCollection('approvals', APPROVALS, 'id');

  return (
    <>
      <PageHeader
        eyebrow={t('approvals.eyebrow')}
        title={t('approvals.title')}
        sub={`${items.length} ${t('approvals.pending')}`}
        right={
          <>
            <Button kind="soft" onClick={() => a.open(t('approvals.viewAll'))}>{t('approvals.viewAll')}</Button>
            <Button kind="primary" onClick={() => a.open(t('common.history'))}>{t('common.history')}</Button>
          </>
        }
      />
      <div className="ad-approvals">
        {items.length === 0 && <div className="ad-empty">{t('approvals.empty')}</div>}
        {items.map((it) => (
          <Card key={it.id} pad={false} className="ad-appr-card">
            <div className="ad-apc-rail" style={{ background: it.tone }} />
            <div className="ad-apc-body">
              <div className="ad-apc-top">
                <div className="ad-apc-ic" style={{ background: it.tone + '22', color: it.tone }}>{cloneElement(KIND_ICON[it.kind], { size: 16 })}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ad-apc-t">{it.t}</div>
                  <div className="ad-apc-who">{it.who}</div>
                </div>
                {it.amt && <Money uzs={it.amt} style={{ fontWeight: 700, fontSize: 14 }} />}
              </div>
              <div className="ad-apc-sub">{it.sub}</div>
              <div className="ad-apc-foot">
                <span className="ad-apc-by">{t('approvals.requestedBy')}: <b>{it.by}</b></span>
                <div className="ad-apc-acts">
                  <button className="ad-btn ad-btn-soft" onClick={() => a.reject(it.who, { onConfirm: () => remove(it.id) })}>{cloneElement(Icons.x, { size: 13 })} {t('common.reject')}</button>
                  <button className="ad-btn ad-btn-primary" onClick={() => a.approve(it.who, { onConfirm: () => remove(it.id) })}>{cloneElement(Icons.check, { size: 13 })} {t('common.approve')}</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
