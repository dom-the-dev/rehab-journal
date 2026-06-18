import React, { useMemo } from 'react';
import { toDateKey, painColor } from '../utils';
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
