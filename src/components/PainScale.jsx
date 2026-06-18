import React from 'react';
import { painColor, painLabel, painMoodLabel } from '../utils';

export function PainScale({ label, sublabel, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
          {sublabel && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>{sublabel}</span>}
        </div>
        {value !== null && value !== undefined && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: painColor(value) }}>{value}</span>
            <span style={{ fontSize: 10, color: value >= 5 ? 'var(--orange)' : 'var(--green)', display: 'block', lineHeight: 1 }}>
              {value >= 5 ? '⚠ Zu hohe Belastung' : '✓ OK'}
            </span>
          </div>
        )}
      </div>

      {/* Two rows on mobile via flex-wrap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 3 }}>
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(value === i ? null : i)}
            style={{
              height: 44,
              border: 'none',
              borderRadius: 8,
              background: value === i ? painColor(i) : 'var(--bg-4)',
              color: value === i ? '#000' : painColor(i),
              fontSize: 13,
              fontWeight: 700,
              transition: 'all 0.12s',
              outline: value === i ? `2px solid ${painColor(i)}` : 'none',
              outlineOffset: 2,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {i}
          </button>
        ))}
      </div>

      {value !== null && value !== undefined && (
        <div style={{ fontSize: 11, color: painColor(value), fontWeight: 500, lineHeight: 1.4 }}>
          {painMoodLabel(value)} · {painLabel(value)}
        </div>
      )}
    </div>
  );
}
