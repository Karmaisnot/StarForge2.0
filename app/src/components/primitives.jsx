import { usePreferences } from '../context/PreferencesContext.jsx';
import { fmtMoney } from '../lib/format.js';

// 8-point star logomark — the StarForge identity.
export function SfStar({ size = 24, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style}>
      <path
        d="M16 1 L19.4 11.2 L29.9 11.5 L21.3 17.6 L24.5 27.9 L16 21.4 L7.5 27.9 L10.7 17.6 L2.1 11.5 L12.6 11.2 Z"
        fill={color}
      />
      <circle cx="16" cy="16" r="2.2" fill="var(--sf-bg, #FBF6EC)" />
    </svg>
  );
}

// Avatar — solid circle with initials, colour stable per name.
const AVATAR_COLORS = ['#B85535', '#D89A2E', '#4F7B3B', '#2A6F9F', '#7A4A82', '#A55A24', '#3F6E5C'];
export function SfAvatar({ name = 'A', size = 36, color }) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  const bg = color || AVATAR_COLORS[hash];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#FFFCF5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--sf-font-ui)',
        fontWeight: 700,
        fontSize: size * 0.4,
        letterSpacing: '-0.01em',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function SfAiBadge({ children = 'AI', compact }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compact ? '3px 8px' : '5px 10px',
        borderRadius: 999,
        background: 'var(--sf-ai-bg)',
        border: '1px solid var(--sf-ai-border)',
        color: 'var(--sf-ai)',
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--sf-font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: compact ? 13 : 14,
          textTransform: 'none',
          letterSpacing: 0,
        }}
      >
        Ai
      </span>
      {children !== 'AI' && children}
    </span>
  );
}

// Status pill.
export function Pill({ tone = 'neutral', children, dot }) {
  return (
    <span className={'ad-pill ad-pill-' + tone}>
      {dot && <span className="ad-pill-dot" />}
      {children}
    </span>
  );
}

// Mini progress bar.
export function Bar({ pct, color = 'var(--sf-primary)', h = 6 }) {
  return (
    <div className="ad-bar" style={{ height: h }}>
      <div style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// Currency-aware money figure.
export function Money({ uzs, className, style }) {
  const { cur } = usePreferences();
  return <span className={'sf-mono ' + (className || '')} style={style}>{fmtMoney(uzs, cur)}</span>;
}

// Buttons.
export function Button({ children, kind = 'soft', onClick, accent, type = 'button', style, disabled = false }) {
  return (
    <button
      type={type}
      className={'ad-btn ad-btn-' + kind}
      onClick={onClick}
      disabled={disabled}
      style={{ ...(accent && kind === 'primary' ? { background: accent } : {}), ...style }}
    >
      {children}
    </button>
  );
}

// Card shell.
export function Card({ title, action, children, pad = true, className = '', style }) {
  return (
    <div className={'ad-card ' + className} style={style}>
      {title && (
        <div className="ad-card-h">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      <div className={pad ? 'ad-card-b' : ''}>{children}</div>
    </div>
  );
}

// Section header.
export function SectionHeader({ children, action }) {
  return (
    <div className="ad-sech">
      <h3>{children}</h3>
      {action}
    </div>
  );
}

// Page header.
export function PageHeader({ title, sub, right, eyebrow }) {
  return (
    <div className="ad-page-h">
      <div>
        {eyebrow && <div className="ad-page-eyebrow">{eyebrow}</div>}
        <h1 className="ad-page-title">{title}</h1>
        {sub && <div className="ad-page-sub">{sub}</div>}
      </div>
      {right && <div className="ad-page-right">{right}</div>}
    </div>
  );
}
