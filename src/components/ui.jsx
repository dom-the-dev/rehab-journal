import React from 'react';

export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
      <style>{`
        .card {
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }
      `}</style>
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', style, disabled }) {
  const styles = {
    primary: { background: 'var(--brand)', color: '#000', border: 'none' },
    secondary: { background: 'var(--bg-4)', color: 'var(--text)', border: '1px solid var(--border-light)' },
    ghost: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    danger: { background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)' },
  };
  const sizes = {
    sm: { padding: '4px 10px', fontSize: '12px', borderRadius: '6px' },
    md: { padding: '8px 16px', fontSize: '14px', borderRadius: '8px' },
    lg: { padding: '12px 24px', fontSize: '15px', borderRadius: '10px', fontWeight: 600 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        ...sizes[size],
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontWeight: 500,
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, min, max, step, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{
          background: 'var(--bg-4)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: '10px 12px',
          color: 'var(--text)',
          fontSize: 16,
          outline: 'none',
          width: '100%',
          WebkitAppearance: 'none',
          ...style,
        }}
      />
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          background: 'var(--bg-4)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: '8px 12px',
          color: 'var(--text)',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          resize: 'vertical',
        }}
      />
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: 'var(--bg-3)', border: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 600,
        maxHeight: '92dvh', overflowY: 'auto',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: 20, lineHeight: 1, cursor: 'pointer',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: color + '22', color: color,
      borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600,
    }}>
      {children}
    </span>
  );
}
