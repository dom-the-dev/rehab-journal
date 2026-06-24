export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  return toDateKey(new Date());
}

export function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

export function painColor(val) {
  if (val === null || val === undefined) return 'var(--text-dim)';
  if (val <= 2) return 'var(--green)';
  if (val <= 4) return '#84cc16';
  if (val === 5) return 'var(--orange)';
  return 'var(--red)';
}

export function painLabel(val) {
  const map = {
    0: 'Kein Schmerz',
    1: 'Sehr leichter Schmerz',
    2: 'Leichter Schmerz',
    3: 'Mäßiger Schmerz',
    4: 'Recht starker Schmerz',
    5: 'Starker Schmerz',
    6: 'Sehr starker Schmerz',
    7: 'Starker Schmerz',
    8: 'Extremer Schmerz',
    9: 'Fast maximaler Schmerz',
    10: 'Maximaler Schmerz',
  };
  return map[val] ?? '';
}

export function painMoodLabel(val) {
  const map = {
    0: 'Könnte mir nicht besser gehen',
    1: 'Sehr gutes Befinden',
    2: 'Gutes Befinden',
    3: 'Mäßiges Befinden',
    4: 'Eher schlechtes Befinden',
    5: 'Schlechtes Befinden',
    6: 'Sehr schlechtes Befinden',
    7: 'Schlechtes Befinden',
    8: 'Extrem schlechtes Befinden',
    9: 'Fast schlimmstes Befinden',
    10: 'Könnte mir nicht schlechter gehen',
  };
  return map[val] ?? '';
}

export function getLastRun(days) {
  const sortedKeys = Object.keys(days).sort().reverse();
  for (const dateKey of sortedKeys) {
    const day = days[dateKey];
    if (day.runs?.length > 0) {
      const run = day.runs[day.runs.length - 1];
      return {
        dateKey,
        distance: parseFloat(run.distance) || 0,
        wb: run.wb ?? null,
        s2: run.s2 ?? null,
        name: run.name,
      };
    }
  }
  return null;
}

export function getRunRecommendation(lastRun, days) {
  if (!lastRun) return null;
  const { distance, wb, dateKey: runDateKey } = lastRun;

  // Collect S1 values from days strictly between last run and today
  const todayKey = today();
  const s1Values = Object.entries(days)
    .filter(([k]) => k > runDateKey && k <= todayKey)
    .map(([, d]) => d.s1)
    .filter(v => v !== null && v !== undefined);
  const maxS1 = s1Values.length > 0 ? Math.max(...s1Values) : null;

  const runOk = wb !== null && wb <= 3;
  const daysOk = maxS1 === null || maxS1 <= 3;

  if (wb === null && maxS1 === null) {
    return { label: `Letzte Distanz: ${distance} km`, color: 'var(--text-muted)', maxS1, wb };
  }
  if (runOk && daysOk) {
    return { label: `Steigern → ${(distance + 0.5).toFixed(1)} km`, color: 'var(--green)', maxS1, wb };
  }
  if (wb !== null && wb <= 5 && (maxS1 === null || maxS1 <= 5)) {
    return { label: `Distanz halten → ${distance} km`, color: 'var(--orange)', maxS1, wb };
  }
  return { label: `Beschwerden zu hoch — ${distance} km halten`, color: 'var(--red)', maxS1, wb };
}

export function getNextDueDate(days, workoutTemplates, type) {
  // type: 'run' | 'rehab'
  const rehabIds = new Set(
    (workoutTemplates || []).filter(w => w.isRehab).map(w => w.id)
  );

  const sortedKeys = Object.keys(days).sort();
  let lastDate = null;

  for (const key of sortedKeys) {
    const day = days[key];
    if (type === 'run' && day.runs?.length > 0) lastDate = key;
    if (type === 'rehab' && day.workouts?.some(w => rehabIds.has(w.templateId))) lastDate = key;
  }

  if (!lastDate) return null;
  const [y, m, d] = lastDate.split('-').map(Number);
  const next = new Date(y, m - 1, d + 3);
  return toDateKey(next);
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
