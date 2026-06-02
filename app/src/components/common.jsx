import { cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from './Icons.jsx';

// Dense table. Presentational — caller owns rows + sorting semantics.
export function DataTable({ cols, children }) {
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: c.align || 'left', width: c.w }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {c.label}
                  {c.sort && cloneElement(Icons.chevD, { size: 11, style: { opacity: 0.5 } })}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// Controlled filter bar — parent owns search text and active chips.
export function FilterBar({ search, onSearch, searchPlaceholder, chips, onToggleChip, right }) {
  const { t } = useTranslation();
  return (
    <div className="ad-filterbar">
      <div className="ad-search">
        {cloneElement(Icons.search, { size: 15, style: { color: 'var(--sf-muted)' } })}
        <input
          placeholder={searchPlaceholder || t('common.search')}
          value={search ?? ''}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <div className="ad-filter-chips">
        {chips?.map((c, i) => (
          <button key={i} className={'ad-fchip' + (c.on ? ' on' : '')} onClick={() => onToggleChip?.(i, c)}>
            {c.icon && cloneElement(c.icon, { size: 12 })}
            {c.l}
            {c.n != null && <span className="ad-fchip-n">{c.n}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

// Segmented control — controlled.
export function Segmented({ options, value, onChange, size = 'sm' }) {
  return (
    <div className={size === 'sm' ? 'ad-seg-sm' : 'ad-seg-sm'}>
      {options.map((opt) => (
        <button key={opt.id} className={value === opt.id ? 'on' : ''} onClick={() => onChange?.(opt.id)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Pagination footer.
export function Pagination({ label, page = 1, pages = 1, onPage }) {
  const nums = [];
  const last = pages;
  nums.push(1);
  if (page > 3) nums.push('…');
  for (let p = Math.max(2, page - 1); p <= Math.min(last - 1, page + 1); p++) nums.push(p);
  if (page < last - 2) nums.push('…');
  if (last > 1) nums.push(last);
  return (
    <div className="ad-table-foot">
      <span>{label}</span>
      <div className="ad-pager">
        <button onClick={() => onPage?.(Math.max(1, page - 1))}>‹</button>
        {nums.map((nDot, i) =>
          nDot === '…' ? (
            <span key={'d' + i}>…</span>
          ) : (
            <button key={nDot} className={nDot === page ? 'on' : ''} onClick={() => onPage?.(nDot)}>
              {nDot}
            </button>
          ),
        )}
        <button onClick={() => onPage?.(Math.min(last, page + 1))}>›</button>
      </div>
    </div>
  );
}
