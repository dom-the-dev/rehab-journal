import React, { useState } from 'react';
import { toDateKey, getDaysInMonth, getFirstDayOfMonth, WEEKDAYS_SHORT, MONTHS_DE, painColor, today, formatDateShort } from '../utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Calendar({ days, onSelectDay, selectedDay, nextRunDate, nextRehabDate }) {
  const todayKey = today();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function getDayIndicator(dateKey) {
    const d = days[dateKey];
    if (!d) return null;
    const hasData = d.wb !== null || d.s1 !== null || d.s2 !== null || d.workouts?.length || d.runs?.length || d.note;
    if (!hasData) return null;
    const vals = [d.wb, d.s1, d.s2].filter(v => v !== null && v !== undefined);
    const maxVal = vals.length ? Math.max(...vals) : null;
    return { maxVal, workouts: d.workouts?.length || 0, runs: d.runs?.length || 0, note: !!d.note };
  }

  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          {MONTHS_DE[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekdays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAYS_SHORT.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDay;
          const indicator = getDayIndicator(dateKey);
          const isNextRun = dateKey === nextRunDate;
          const isNextRehab = dateKey === nextRehabDate;

          return (
            <button
              key={day}
              onClick={() => onSelectDay(dateKey)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                border: isSelected ? '2px solid var(--brand)' : isToday ? '1px solid var(--brand)' : (isNextRun || isNextRehab) ? '1px solid transparent' : '1px solid transparent',
                borderRadius: 10,
                background: isSelected ? 'var(--brand)22' : isNextRun && isNextRehab ? 'linear-gradient(135deg, #38bdf822 50%, var(--brand)22 50%)' : isNextRun ? '#38bdf818' : isNextRehab ? 'var(--brand)18' : 'var(--bg-4)',
                color: isSelected ? 'var(--brand)' : isToday ? 'var(--brand)' : 'var(--text)',
                outline: (isNextRun || isNextRehab) && !isSelected ? `2px dashed ${isNextRun && isNextRehab ? 'var(--brand)' : isNextRun ? '#38bdf8' : 'var(--brand)'}` : 'none',
                outlineOffset: -2,
                fontSize: 13,
                fontWeight: isToday || isSelected ? 700 : 400,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                transition: 'all 0.1s',
              }}
            >
              {day}
              {indicator && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {indicator.maxVal !== null && (
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: painColor(indicator.maxVal),
                    }} />
                  )}
                  {indicator.workouts > 0 && (
                    <div style={{ width: 5, height: 5, borderRadius: 1, background: 'var(--brand)' }} />
                  )}
                  {indicator.runs > 0 && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8' }} />
                  )}
                  {indicator.note && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)' }} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Due-date hints */}
      {(nextRunDate || nextRehabDate) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12, padding: '10px 12px', background: 'var(--bg-4)', borderRadius: 8 }}>
          {nextRunDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px dashed #38bdf8', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>Nächster Lauf:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{formatDateShort(nextRunDate)}</span>
            </div>
          )}
          {nextRehabDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, border: '2px dashed var(--brand)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>Nächstes Rehab-Workout:</span>
              <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{formatDateShort(nextRehabDate)}</span>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--green)', label: 'Schmerz OK (0–4)' },
          { color: 'var(--red)', label: 'Zu hoch (5+)' },
          { color: 'var(--brand)', shape: 'square', label: 'Workout' },
          { color: '#38bdf8', label: 'Lauf' },
        ].map(({ color, label, shape }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <div style={{ width: 6, height: 6, borderRadius: shape === 'square' ? 1 : '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
