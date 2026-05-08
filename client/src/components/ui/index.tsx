'use client';
// ============================================
// Shared UI Component Library
// ============================================
import React, { useState, useEffect, useRef, ReactNode } from 'react';

// ─── BUTTON ─────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type BtnSize = 'sm' | 'md' | 'lg';

export function Button({ children, variant = 'primary', size = 'md', disabled, onClick, className, style, type = 'button' }: {
  children: ReactNode; variant?: BtnVariant; size?: BtnSize; disabled?: boolean;
  onClick?: () => void; className?: string; style?: React.CSSProperties; type?: 'button' | 'submit';
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className || ''}`} style={style}>
      {children}
    </button>
  );
}

// ─── BADGE ─────────────────
export function Badge({ children, variant = 'default', style }: { children: ReactNode; variant?: string; style?: React.CSSProperties }) {
  return <span className={`badge badge-${variant}`} style={style}>{children}</span>;
}

// ─── AVATAR ─────────────────
export function Avatar({ firstName, lastName, size = 32, isOnline, src, style }: {
  firstName?: string; lastName?: string; size?: number; isOnline?: boolean; src?: string; style?: React.CSSProperties;
}) {
  const hue = (firstName?.charCodeAt(0) || 0) * 47 % 360;
  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      {src ? (
        <img src={src} alt={`${firstName} ${lastName}`} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%', background: `hsl(${hue}, 55%, 55%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.35, fontWeight: 700, color: 'white',
        }}>
          {firstName?.[0]}{lastName?.[0]}
        </div>
      )}
      {isOnline !== undefined && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: size * 0.3, height: size * 0.3,
          borderRadius: '50%', border: '2px solid white',
          background: isOnline ? '#00B894' : '#636E72',
        }} />
      )}
    </div>
  );
}

// ─── MODAL ─────────────────
export function Modal({ children, isOpen, onClose, title, maxWidth = 520 }: {
  children: ReactNode; isOpen: boolean; onClose: () => void; title?: string; maxWidth?: number;
}) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{ animation: 'fadeIn 0.15s ease' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth, padding: 0, animation: 'slideUp 0.2s ease' }}>
        {title && (
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ width: 28, height: 28 }}>✕</button>
          </div>
        )}
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── SKELETON ─────────────────
export function Skeleton({ width, height = 20, radius = 8, style }: { width?: number | string; height?: number; radius?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

// ─── EMPTY STATE ─────────────────
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      {icon}
      <h3 style={{ marginTop: 12, fontWeight: 600 }}>{title}</h3>
      {description && <p style={{ marginTop: 4, color: 'var(--color-text-secondary)' }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────
export function ProgressBar({ value, color = 'var(--color-primary)', height = 6, label, showPct }: {
  value: number; color?: string; height?: number; label?: string; showPct?: boolean;
}) {
  return (
    <div>
      {(label || showPct) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          {label && <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>}
          {showPct && <span style={{ fontWeight: 600 }}>{Math.round(value)}%</span>}
        </div>
      )}
      <div style={{ width: '100%', height, background: 'var(--color-bg)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ─── ANIMATED COUNTER ─────────────────
export function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

// ─── KPI CARD ─────────────────
export function KPICard({ title, value, icon, color = '#6C5CE7', trend, suffix }: {
  title: string; value: number | string; icon?: ReactNode; color?: string; trend?: number; suffix?: string;
}) {
  return (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: color, opacity: 0.06 }} />
      {icon && (
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          {icon}
        </div>
      )}
      <div className="stat-value" style={{ color, fontSize: 26 }}>
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}{suffix}
      </div>
      <div className="stat-label">{title}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 11, marginTop: 4, color: trend >= 0 ? '#00B894' : '#E17055', fontWeight: 600 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}

// ─── TABS ─────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (key: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-border-light)', marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: '10px 20px', fontSize: 13, fontWeight: active === t.key ? 600 : 400, cursor: 'pointer',
          color: active === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          borderBottom: active === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
          background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', marginBottom: -2, transition: 'all 0.15s ease',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── TOAST ─────────────────
let toastTimeout: NodeJS.Timeout;
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const existing = document.getElementById('pms-toast');
  if (existing) existing.remove();

  const colors = { success: '#00B894', error: '#E17055', info: '#6C5CE7' };
  const el = document.createElement('div');
  el.id = 'pms-toast';
  el.innerHTML = message;
  Object.assign(el.style, {
    position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px',
    background: colors[type], color: 'white', borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', zIndex: '10000', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    animation: 'slideUp 0.3s ease', fontFamily: 'inherit',
  });
  document.body.appendChild(el);
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.remove(), 3500);
}

// ─── SEARCH INPUT ─────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...', width = 220 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; width?: number;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      <input className="input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ paddingLeft: 34, width, fontSize: 13 }} />
    </div>
  );
}

// ─── DROPDOWN ─────────────────
export function Dropdown({ trigger, children, align = 'right' }: { trigger: ReactNode; children: ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>{trigger}</div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', [align]: 0, marginTop: 4, minWidth: 180, zIndex: 100,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', padding: '4px 0', animation: 'fadeIn 0.15s ease',
        }} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger }: { children: ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px',
      background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left',
      color: danger ? 'var(--color-error)' : 'var(--color-text)',
      transition: 'background 0.1s',
    }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
       onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      {children}
    </button>
  );
}
