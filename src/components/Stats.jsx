import React, { useMemo } from 'react';
import { toDateKey, painColor, WEEKDAYS_SHORT } from '../utils';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Flame, Footprints, Dumbbell } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────

function getLast(days, n) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i));
    const key = toDateKey(d);
    return { key, ...days[key] };
  });
}

function getWeeks(days, n) {
  const today = new Date();
  const weeks = [];
  for (let w = n - 1; w >= 0; w--) {
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() - w * 7 + 1);
    const days7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return toDateKey(d);
    });
    const label = `KW ${getWeekNum(start)}`;
    weeks.push({ label, days: days7 });
  }
  return weeks;
}

function getWeekNum(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// ── mini components ───────────────────────────────────────────

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {Icon && <Icon size={13} color={color || 'var(--text-muted)'} />}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || 'var(--text)', lineHeight: 1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function LineChart({ data, height = 120, threshold = 5 }) {
  const valid = data.filter(d => d.value !== null && d.value !== undefined);
  if (valid.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 12 }}>Noch nicht genug Daten</div>;

  const W = 600, H = height;
  const pad = { t: 10, b: 24, l: 24, r: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xStep = innerW / (data.length - 1);

  function x(i) { return pad.l + i * xStep; }
  function y(v) { return pad.t + innerH - (v / 10) * innerH; }

  const points = data.map((d, i) => d.value !== null && d.value !== undefined ? `${x(i)},${y(d.value)}` : null);
  const segments = [];
  let current = [];
  points.forEach((p, i) => {
    if (p) {
      current.push(p);
    } else {
      if (current.length > 1) segments.push(current.join(' '));
      current = [];
    }
  });
  if (current.length > 1) segments.push(current.join(' '));

  const threshY = y(threshold);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      {/* threshold line */}
      <line x1={pad.l} y1={threshY} x2={W - pad.r} y2={threshY} stroke="var(--red)" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
      <text x={pad.l} y={threshY - 3} fontSize="9" fill="var(--red)" opacity="0.7">5</text>

      {/* grid */}
      {[0,2,4,6,8,10].map(v => (
        <line key={v} x1={pad.l} y1={y(v)} x2={W - pad.r} y2={y(v)} stroke="var(--border)" strokeWidth="0.5" />
      ))}

      {/* line segments */}
      {segments.map((seg, i) => (
        <polyline key={i} points={seg} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" />
      ))}

      {/* dots */}
      {data.map((d, i) => d.value !== null && d.value !== undefined && (
        <circle key={i} cx={x(i)} cy={y(d.value)} r="3.5"
          fill={d.value >= threshold ? 'var(--red)' : 'var(--green)'}
          stroke="var(--bg-3)" strokeWidth="1.5"
        />
      ))}

      {/* x labels — every 7 days */}
      {data.map((d, i) => i % 7 === 0 && (
        <text key={i} x={x(i)} y={H - 4} fontSize="8" fill="var(--text-dim)" textAnchor="middle">{d.label}</text>
      ))}
    </svg>
  );
}

function BarChart({ bars, height = 100, color = 'var(--brand)', maxVal }) {
  if (!bars.length) return null;
  const max = maxVal ?? Math.max(...bars.map(b => b.value || 0), 1);
  const W = 600, H = height;
  const pad = { t: 8, b: 20, l: 8, r: 8 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const bw = innerW / bars.length;
  const gap = bw * 0.2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
      {bars.map((b, i) => {
        const bh = max > 0 ? ((b.value || 0) / max) * innerH : 0;
        const bx = pad.l + i * bw + gap / 2;
        const by = pad.t + innerH - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw - gap} height={bh} fill={color} rx="2" opacity="0.85" />
            <text x={bx + (bw - gap) / 2} y={H - 4} fontSize="8" fill="var(--text-dim)" textAnchor="middle">{b.label}</text>
            {b.value > 0 && bh > 14 && (
              <text x={bx + (bw - gap) / 2} y={by + 11} fontSize="8" fill="#000" textAnchor="middle" fontWeight="700">{b.value}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── monthly journal table ─────────────────────────────────────

function getMonthWeeks(year, month) {
  // Returns array of weeks (each = 7 dateKeys Mo–So) that overlap with the given month
  const firstDay = new Date(year, month, 1);
  const dow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 0=Mon
  const start = new Date(year, month, 1 - dow); // Monday of first week

  const weeks = [];
  let cur = new Date(start);
  while (cur.getFullYear() < year || cur.getMonth() < month || (cur.getMonth() === month && cur.getDate() <= new Date(year, month + 1, 0).getDate())) {
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(cur);
      d.setDate(d.getDate() + i);
      return toDateKey(d);
    });
    weeks.push(week);
    cur.setDate(cur.getDate() + 7);
    if (weeks.length > 6) break;
  }
  return weeks;
}

const MONTHS_DE_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

function printMonth(weeks, days, monthLabel) {
  const painHex = v => {
    if (v <= 2) return '#22c55e';
    if (v <= 4) return '#84cc16';
    if (v === 5) return '#f97316';
    return '#ef4444';
  };

  const rows = weeks.map(week => week.map(key => {
    const [, mm, dd] = key.split('-').map(Number);
    const day = days[key];
    const s1 = day?.s1 ?? null;
    const activities = [
      ...(day?.workouts || []).map(w => ({ type: 'workout', label: w.name, wb: w.wb ?? null, s2: w.s2 ?? null })),
      ...(day?.runs || []).map(r => ({ type: 'run', label: `${r.distance}km`, wb: r.wb ?? null, s2: r.s2 ?? null })),
    ];
    const steps = day?.steps ? parseInt(day.steps) : null;
    return { dd: String(dd).padStart(2,'0'), mm: String(mm).padStart(2,'0'), s1, activities, steps };
  }));

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>RehabJournal – ${monthLabel}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; padding: 20px; color: #111; background: #fff; }
  h1 { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
  .sub { font-size: 11px; color: #888; margin-bottom: 16px; }
  table { width: 100%; border-collapse: separate; border-spacing: 4px; table-layout: fixed; }
  th { font-size: 10px; font-weight: 700; color: #888; text-align: center; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { vertical-align: top; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; padding: 0; }
  .bar { height: 4px; }
  .inner { padding: 5px 5px 7px; }
  .date { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .day { font-size: 13px; font-weight: 700; color: #111; }
  .s1 { font-size: 13px; font-weight: 800; }
  .act { font-size: 9px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wb-s2 { font-size: 9px; color: #888; padding-left: 10px; margin-bottom: 2px; }
  .steps { font-size: 9px; color: #888; margin-top: 3px; }
  @media print { body { padding: 10px; } }
</style></head><body>
<h1>RehabJournal</h1>
<div class="sub">${monthLabel} · gedruckt ${new Date().toLocaleDateString('de-DE')}</div>
<table>
  <thead><tr>${['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>`<th>${d}</th>`).join('')}</tr></thead>
  <tbody>
  ${rows.map(week => `<tr>${week.map(({dd,mm,s1,activities,steps}) => {
    const barColor = s1 !== null ? painHex(s1) : '#e5e7eb';
    const s1Color = s1 !== null ? painHex(s1) : '';
    return `<td>
      <div class="bar" style="background:${barColor}"></div>
      <div class="inner">
        <div class="date">
          <span class="day">${dd}.${mm}.</span>
          ${s1 !== null ? `<span class="s1" style="color:${s1Color}">${s1}</span>` : ''}
        </div>
        ${activities.map(a => `
          <div class="act" style="color:${a.type==='run'?'#0ea5e9':'#f97316'}">${a.type==='run'?'🏃':'🏋'} ${a.label}</div>
          ${(a.wb!==null||a.s2!==null)?`<div class="wb-s2">${a.wb!==null?`WB<b style="color:${painHex(a.wb)}">${a.wb}</b> `:''}${a.s2!==null?`S2<b style="color:${painHex(a.s2)}">${a.s2}</b>`:''}</div>`:''}`).join('')}
        ${steps!==null?`<div class="steps">👟 ${steps>=1000?(steps/1000).toFixed(1)+'k':steps}</div>`:''}
      </div>
    </td>`;
  }).join('')}</tr>`).join('\n')}
  </tbody>
</table>
<div style="margin-top:14px;font-size:10px;color:#aaa;display:flex;gap:16px">
  <span>● S1 Wohlbefinden morgens (0–10)</span>
  <span>WB = während Training · S2 = danach</span>
  <span style="color:#22c55e">■ 0–2</span><span style="color:#84cc16">■ 3–4</span><span style="color:#f97316">■ 5</span><span style="color:#ef4444">■ 6+</span>
</div>
</body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function MonthlyTable({ days }) {
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());
  const todayKey = toDateKey(now);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const weeks = useMemo(() => getMonthWeeks(year, month), [year, month]);
  const monthLabel = `${MONTHS_DE_SHORT[month]} ${year}`;

  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Journal</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={{ background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: '3px 10px', fontSize: 16, lineHeight: 1 }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 72, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={nextMonth} style={{ background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: '3px 10px', fontSize: 16, lineHeight: 1 }}>›</button>
          <button onClick={() => printMonth(weeks, days, monthLabel)} style={{
            background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 10px', fontSize: 11, fontWeight: 600,
          }}>🖨 Drucken</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px 3px', tableLayout: 'fixed', minWidth: 380 }}>
          <thead>
            <tr>
              {WEEKDAYS_SHORT.map(wd => (
                <th key={wd} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textAlign: 'center', paddingBottom: 6 }}>{wd}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map(key => {
                  const [y, mm, dd] = key.split('-').map(Number);
                  const inMonth = y === year && (mm - 1) === month;
                  const isToday = key === todayKey;
                  const day = days[key];
                  const s1 = day?.s1 ?? null;
                  const workouts = day?.workouts || [];
                  const runs = day?.runs || [];
                  const steps = day?.steps ? parseInt(day.steps) : null;
                  const hasActivity = workouts.length > 0 || runs.length > 0;
                  const activities = [
                    ...workouts.map(w => ({ type: 'workout', label: w.name, wb: w.wb ?? null, s2: w.s2 ?? null })),
                    ...runs.map(r => ({ type: 'run', label: `${r.distance}km`, wb: r.wb ?? null, s2: r.s2 ?? null })),
                  ];

                  const s1Color = s1 !== null ? painColor(s1) : null;

                  return (
                    <td key={key} style={{
                      verticalAlign: 'top',
                      opacity: inMonth ? 1 : 0.2,
                      background: isToday ? '#ffffff08' : 'var(--bg-4)',
                      borderRadius: 8,
                      border: isToday ? '1px solid var(--brand)66' : '1px solid transparent',
                      overflow: 'hidden',
                      padding: 0,
                    }}>
                      {/* S1 color bar at top */}
                      <div style={{
                        height: 3,
                        background: s1 !== null ? painColor(s1) : 'var(--border)',
                        opacity: s1 !== null ? 0.8 : 0.3,
                      }} />

                      <div style={{ padding: '5px 4px 6px' }}>
                        {/* Date with leading zero */}
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: isToday ? 'var(--brand)' : inMonth ? 'var(--text)' : 'var(--text-dim)',
                          }}>{String(dd).padStart(2,'0')}.</span>
                          {/* S1 value */}
                          {s1 !== null && (
                            <span style={{ fontSize: 12, fontWeight: 800, color: s1Color }}>{s1}</span>
                          )}
                        </div>

                        {/* Activities */}
                        {activities.map((a, i) => (
                          <div key={i} style={{ marginBottom: 3 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <span style={{ fontSize: 10 }}>{a.type === 'run' ? '🏃' : '🏋'}</span>
                              <span style={{
                                fontSize: 10, fontWeight: 600, flex: 1,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                color: a.type === 'run' ? '#38bdf8' : 'var(--brand)',
                              }}>{a.label}</span>
                            </div>
                            {(a.wb !== null || a.s2 !== null) && (
                              <div style={{ display: 'flex', gap: 4, paddingLeft: 12, marginTop: 1 }}>
                                {a.wb !== null && (
                                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                                    WB<span style={{ fontWeight: 700, color: painColor(a.wb) }}>{a.wb}</span>
                                  </span>
                                )}
                                {a.s2 !== null && (
                                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                                    S2<span style={{ fontWeight: 700, color: painColor(a.s2) }}>{a.s2}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Steps */}
                        {steps !== null && (
                          <div style={{ marginTop: hasActivity ? 3 : 0 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              color: steps >= 8000 ? 'var(--green)' : steps >= 5000 ? 'var(--brand)' : 'var(--text-dim)',
                            }}>👟{steps >= 1000 ? `${(steps/1000).toFixed(1)}k` : steps}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Legende</span>
        {[
          { color: 'var(--green)', label: 'S1 0–2' },
          { color: '#84cc16', label: 'S1 3–4' },
          { color: 'var(--orange)', label: 'S1 5' },
          { color: 'var(--red)', label: 'S1 6+' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 16, height: 3, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>🏋</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Workout</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>🏃</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Lauf</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>👟</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Schritte</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>WB = während · S2 = danach</span>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────

export function Stats({ days, workoutTemplates }) {
  const rehabIds = useMemo(() => new Set((workoutTemplates || []).filter(w => w.isRehab).map(w => w.id)), [workoutTemplates]);

  const last30 = useMemo(() => getLast(days, 30), [days]);
  const last14 = useMemo(() => getLast(days, 14), [days]);
  const last8weeks = useMemo(() => getWeeks(days, 8), [days]);

  // ── S1 stats ──
  const s1Values = last30.map(d => ({ key: d.key, value: d.s1 ?? null, label: d.key?.slice(5) }));
  const validS1 = s1Values.filter(d => d.value !== null);
  const lastS1 = validS1.at(-1)?.value ?? null;
  const avgS1 = validS1.length ? Math.round(validS1.reduce((a, b) => a + b.value, 0) / validS1.length * 10) / 10 : null;

  // streak: consecutive days S1 < 5 (from today backwards)
  let streak = 0;
  for (let i = last30.length - 1; i >= 0; i--) {
    const v = last30[i].s1;
    if (v === null || v === undefined) break;
    if (v < 5) streak++;
    else break;
  }

  // warning: 2+ consecutive days S1 >= 5
  let warnDays = 0;
  for (let i = last14.length - 1; i >= 0; i--) {
    const v = last14[i].s1;
    if (v !== null && v !== undefined && v >= 5) warnDays++;
    else break;
  }
  const warning = warnDays >= 2;

  // trend
  const s1Recent = validS1.slice(-5).map(d => d.value);
  let trend = 'flat';
  if (s1Recent.length >= 3) {
    const first = s1Recent.slice(0, Math.floor(s1Recent.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(s1Recent.length / 2);
    const last_ = s1Recent.slice(-Math.ceil(s1Recent.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(s1Recent.length / 2);
    if (last_ - first > 0.5) trend = 'up';
    else if (first - last_ > 0.5) trend = 'down';
  }

  // ── correlation: Vortag-Aktivität → S1 ──
  const correlationData = useMemo(() => {
    const groups = { lauf: [], rehab: [], workout: [], ruhe: [] };
    last30.forEach((day, i) => {
      if (i === 0 || day.s1 === null || day.s1 === undefined) return;
      const prev = last30[i - 1];
      if (!prev) return;
      const hasRun = (prev.runs?.length || 0) > 0;
      const hasRehab = (prev.workouts || []).some(w => rehabIds.has(w.templateId));
      const hasOtherWorkout = (prev.workouts || []).some(w => !rehabIds.has(w.templateId));
      if (hasRun) groups.lauf.push(day.s1);
      else if (hasRehab) groups.rehab.push(day.s1);
      else if (hasOtherWorkout) groups.workout.push(day.s1);
      else groups.ruhe.push(day.s1);
    });
    return Object.entries(groups).map(([key, vals]) => ({
      label: { lauf: 'Nach Lauf', rehab: 'Nach Rehab', workout: 'Nach Workout', ruhe: 'Ruhetag' }[key],
      avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null,
      n: vals.length,
    })).filter(g => g.n > 0);
  }, [last30, rehabIds]);

  // ── run km per week ──
  const runKmPerWeek = last8weeks.map(w => ({
    label: w.label,
    value: Math.round(w.days.reduce((sum, key) => sum + (days[key]?.runs || []).reduce((s, r) => s + (parseFloat(r.distance) || 0), 0), 0) * 10) / 10,
  }));

  // ── steps per day last 14 ──
  const stepsPerDay = last14.map(d => ({
    label: d.key?.slice(8),
    value: parseInt(d.steps) || 0,
  }));

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--red)' : trend === 'down' ? 'var(--green)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800 }}>Statistiken</h2>

      {/* Warning banner */}
      {warning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--red)15', border: '1px solid var(--red)50', borderRadius: 12, padding: '12px 16px' }}>
          <AlertTriangle size={18} color="var(--red)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>Achtung: S1 seit {warnDays} Tagen ≥ 5</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Belastung reduzieren — Körper erholt sich nicht ausreichend</div>
          </div>
        </div>
      )}

      {/* Monthly journal table */}
      <MonthlyTable days={days} />

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <StatCard label="Letzter S1" value={lastS1 ?? '—'} color={lastS1 !== null ? painColor(lastS1) : undefined}
          sub={lastS1 !== null ? (lastS1 >= 5 ? '⚠ Zu hoch' : '✓ OK') : 'Noch kein Wert'}
          icon={TrendIcon}
        />
        <StatCard label="Ø S1 (30 Tage)" value={avgS1 ?? '—'} color={avgS1 !== null ? painColor(Math.round(avgS1)) : undefined}
          sub="Durchschnitt morgens"
        />
        <StatCard label="Streak" value={streak} color={streak >= 7 ? 'var(--green)' : streak >= 3 ? 'var(--brand)' : 'var(--text-muted)'}
          sub={streak === 1 ? 'Tag S1 < 5' : `Tage S1 < 5`} icon={Flame}
        />
      </div>

      {/* S1 Verlauf */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>S1 – Wohlbefinden morgens</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: trendColor }}>
            <TrendIcon size={13} />
            {trend === 'up' ? 'Steigend' : trend === 'down' ? 'Sinkend' : 'Stabil'}
          </div>
        </div>
        <LineChart data={s1Values} height={130} threshold={5} />
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />OK (0–4)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />Zu hoch (≥5)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
            <div style={{ width: 20, height: 1, background: 'var(--red)', opacity: 0.5 }} />Grenze
          </div>
        </div>
      </div>

      {/* Korrelation */}
      {correlationData.length > 0 && (
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Vortag → S1 morgens
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {correlationData.sort((a, b) => (a.avg ?? 99) - (b.avg ?? 99)).map(g => (
              <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 110, flexShrink: 0 }}>{g.label}</span>
                <div style={{ flex: 1, background: 'var(--bg-4)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${(g.avg / 10) * 100}%`, height: '100%', background: painColor(Math.round(g.avg)), borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: painColor(Math.round(g.avg)), width: 32, textAlign: 'right' }}>{g.avg}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)', width: 40 }}>n={g.n}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10 }}>Ø S1 nach Art des Vortags — je niedriger, desto besser die Erholung</div>
        </div>
      )}

      {/* Lauf-km pro Woche */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Lauf-km / Woche
          </h3>
          <Footprints size={14} color="#38bdf8" />
        </div>
        <BarChart bars={runKmPerWeek} height={90} color="#38bdf8" />
      </div>

      {/* Schritte */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Schritte – letzte 14 Tage
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ziel: 8.000</span>
        </div>
        <BarChart bars={stepsPerDay} height={90} color="var(--brand)" maxVal={Math.max(12000, ...stepsPerDay.map(d => d.value))} />
        <div style={{ marginTop: 6 }}>
          <div style={{ height: 1, background: 'var(--red)', opacity: 0.3, position: 'relative' }}>
          </div>
        </div>
      </div>
    </div>
  );
}
