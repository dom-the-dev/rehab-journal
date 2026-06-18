import React from 'react';
import { Footprints, TrendingUp, AlertCircle } from 'lucide-react';

export function RehabInfo() {
  return (
    <div style={{
      background: 'var(--bg-3)',
      border: '1px solid #1e3a2f',
      borderRadius: 12,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <AlertCircle size={13} color="var(--brand)" />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Rehab-Protokoll
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Footprints size={14} color="#38bdf8" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>Laufen alle 3 Tage</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <TrendingUp size={14} color="var(--green)" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Wenn <span style={{ color: 'var(--text)', fontWeight: 600 }}>2 Wochen</span> alle Schmerz&shy;kriterien erfüllt →{' '}
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>+500m steigern</span>
          </div>
        </div>
      </div>
    </div>
  );
}
