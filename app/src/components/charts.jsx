import { cloneElement } from 'react';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { fmtMoney } from '../lib/format.js';
import { SfStar, SfAvatar } from './primitives.jsx';

export function Sparkline({ data, color = 'var(--sf-primary)', h = 32, fill = true }) {
  const w = 200;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / rng) * (h - 4) - 2]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const gid = 'sg' + Math.random().toString(36).slice(2, 7);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ad-spark" preserveAspectRatio="none">
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AreaChart({ data, labels, color = 'var(--sf-primary)', h = 200 }) {
  const w = 600;
  const pad = 8;
  const max = Math.max(...data) * 1.1;
  const min = 0;
  const rng = max - min || 1;
  const pts = data.map((d, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), h - 24 - ((d - min) / rng) * (h - 40)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${pts[pts.length - 1][0]} ${h - 24} L${pts[0][0]} ${h - 24} Z`;
  const gid = 'ac' + Math.random().toString(36).slice(2, 7);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ad-areachart" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} y1={(h - 24) * g + 4} x2={w - pad} y2={(h - 24) * g + 4} stroke="var(--sf-border)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--sf-surface)" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
      {labels &&
        labels.map((l, i) => (
          <text key={i} x={pts[i][0]} y={h - 6} fontSize="11" fill="var(--sf-muted)" textAnchor="middle" fontFamily="var(--sf-font-mono)">
            {l}
          </text>
        ))}
    </svg>
  );
}

export function BarChart({ series, labels, h = 200, colors = ['var(--sf-primary)', 'var(--sf-accent)'] }) {
  const w = 600;
  const pad = 8;
  const n = labels.length;
  const groups = series.length;
  const all = series.flat();
  const max = Math.max(...all) * 1.1 || 1;
  const slot = (w - pad * 2) / n;
  const bw = Math.min((slot * 0.6) / groups, 26);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ad-barchart" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad} y1={(h - 24) * (1 - g) + 4} x2={w - pad} y2={(h - 24) * (1 - g) + 4} stroke="var(--sf-border)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      ))}
      {labels.map((l, i) => {
        const cx = pad + slot * i + slot / 2;
        return (
          <g key={i}>
            {series.map((s, j) => {
              const bh = (s[i] / max) * (h - 32);
              const x = cx - (bw * groups) / 2 + j * bw;
              return <rect key={j} x={x} y={h - 24 - bh} width={bw - 2} height={bh} rx="3" fill={colors[j]} />;
            })}
            <text x={cx} y={h - 6} fontSize="11" fill="var(--sf-muted)" textAnchor="middle" fontFamily="var(--sf-font-mono)">
              {l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, size = 140, thickness = 18, center }) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.v, 0) || 1;
  let off = 0;
  return (
    <div className="ad-donut" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--sf-surface-2)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.v / total) * circ;
          const el = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={s.c}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-off}
              transform={`rotate(-90 ${c} ${c})`}
              strokeLinecap="butt"
            />
          );
          off += len;
          return el;
        })}
      </svg>
      {center && <div className="ad-donut-c">{center}</div>}
    </div>
  );
}

export function HBars({ rows, max, money }) {
  const { cur } = usePreferences();
  const mx = max || Math.max(...rows.map((r) => r.v)) || 1;
  return (
    <div className="ad-hbars">
      {rows.map((r, i) => (
        <div key={i} className="ad-hbar">
          <span className="ad-hbar-rank">{i + 1}</span>
          {r.avatar && <SfAvatar name={r.label} size={24} />}
          {r.mark && (
            <div className="ad-hbar-mark" style={{ background: r.color || 'var(--sf-primary)' }}>
              <SfStar size={12} color="#FFFCF5" />
            </div>
          )}
          <span className="ad-hbar-label">{r.label}</span>
          <div className="ad-hbar-track">
            <div className="ad-hbar-fill" style={{ width: `${(r.v / mx) * 100}%`, background: r.color || 'var(--sf-primary)' }} />
          </div>
          <span className="ad-hbar-v sf-mono">{money ? fmtMoney(r.v, cur) : r.display || r.v}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ c, l, v }) {
  return (
    <div className="ad-legend">
      <span className="ad-legend-dot" style={{ background: c }} />
      <span className="ad-legend-l">{l}</span>
      <span className="sf-mono ad-legend-v">{v}</span>
    </div>
  );
}

export function Kpi({ label, value, money, spark, trend, accent, icon, sub }) {
  const { cur } = usePreferences();
  const display = money != null ? fmtMoney(money, cur) : value;
  return (
    <div className="ad-kpi">
      <div className="ad-kpi-top">
        <span className="ad-kpi-label">{label}</span>
        {icon && <span className="ad-kpi-icon" style={{ color: accent || 'var(--sf-muted)' }}>{cloneElement(icon, { size: 15 })}</span>}
      </div>
      <div className="ad-kpi-row">
        <span className="sf-mono ad-kpi-v" style={{ color: accent || 'var(--sf-ink)' }}>{display}</span>
        {trend && (
          <span className="ad-kpi-trend" style={{ color: trend.up ? 'var(--sf-success)' : 'var(--sf-danger)' }}>
            {trend.up ? '↑' : '↓'} {trend.v}
          </span>
        )}
      </div>
      {sub && <div className="ad-kpi-sub">{sub}</div>}
      {spark && <Sparkline data={spark} color={accent || 'var(--sf-primary)'} />}
    </div>
  );
}
