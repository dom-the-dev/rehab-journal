import { useState, useEffect, useRef, useCallback } from 'react';

const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const API_KEY = import.meta.env.VITE_JSONBIN_KEY;
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const EMPTY = { days: {}, workoutTemplates: [], runTemplates: [] };
const CACHE_KEY = 'rehab_cache';

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

async function fetchBin() {
  const res = await fetch(`${BASE_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY },
  });
  if (!res.ok) throw new Error(`JSONbin fetch failed: ${res.status}`);
  const json = await res.json();
  return json.record;
}

async function putBin(data) {
  const res = await fetch(BASE_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`JSONbin put failed: ${res.status}`);
  return res.json();
}

export function useStore() {
  const [data, setData] = useState(() => loadCache() ?? EMPTY);
  const [status, setStatus] = useState('loading'); // loading | ok | error | saving
  const saveTimer = useRef(null);
  const latestData = useRef(data);

  latestData.current = data;

  // Initial load from JSONbin
  useEffect(() => {
    fetchBin()
      .then(remote => {
        const merged = { ...EMPTY, ...remote };
        setData(merged);
        saveCache(merged);
        setStatus('ok');
      })
      .catch(() => {
        // Fall back to cache
        setStatus(loadCache() ? 'ok' : 'error');
      });
  }, []);

  // Debounced save to JSONbin (500ms after last change)
  const scheduleSave = useCallback((nextData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setStatus('saving');
    saveCache(nextData);
    saveTimer.current = setTimeout(() => {
      putBin(nextData)
        .then(() => setStatus('ok'))
        .catch(() => setStatus('error'));
    }, 500);
  }, []);

  function update(patch) {
    setData(prev => {
      const next = { ...prev, ...patch };
      scheduleSave(next);
      return next;
    });
  }

  // ── Day helpers ──────────────────────────────────────────────

  function getDay(dateKey) {
    return data.days[dateKey] || { wb: null, s1: null, s2: null, workouts: [], runs: [] };
  }

  function updateDay(dateKey, patch) {
    const current = data.days[dateKey] || { wb: null, s1: null, s2: null, workouts: [], runs: [] };
    update({ days: { ...data.days, [dateKey]: { ...current, ...patch } } });
  }

  // ── Workout / Run assignment ─────────────────────────────────

  function addWorkoutToDay(dateKey, workoutId) {
    const tpl = data.workoutTemplates.find(w => w.id === workoutId);
    if (!tpl) return;
    const day = getDay(dateKey);
    const entry = {
      id: Date.now().toString(),
      templateId: workoutId,
      name: tpl.name,
      exercises: tpl.exercises.map(e => ({ ...e })),
      note: '',
    };
    updateDay(dateKey, { workouts: [...(day.workouts || []), entry] });
  }

  function addRunToDay(dateKey, runId) {
    const tpl = data.runTemplates.find(r => r.id === runId);
    if (!tpl) return;
    const day = getDay(dateKey);
    const entry = {
      id: Date.now().toString(),
      templateId: runId,
      name: tpl.name,
      distance: tpl.distance,
      pace: tpl.pace,
      intervals: tpl.intervals || [],
      note: '',
    };
    updateDay(dateKey, { runs: [...(day.runs || []), entry] });
  }

  function removeWorkoutFromDay(dateKey, entryId) {
    const day = getDay(dateKey);
    updateDay(dateKey, { workouts: (day.workouts || []).filter(w => w.id !== entryId) });
  }

  function removeRunFromDay(dateKey, entryId) {
    const day = getDay(dateKey);
    updateDay(dateKey, { runs: (day.runs || []).filter(r => r.id !== entryId) });
  }

  // ── Templates ────────────────────────────────────────────────

  function saveWorkoutTemplate(tpl) {
    const templates = tpl.id
      ? data.workoutTemplates.map(w => w.id === tpl.id ? tpl : w)
      : [...data.workoutTemplates, { ...tpl, id: Date.now().toString() }];
    update({ workoutTemplates: templates });
  }

  function deleteWorkoutTemplate(id) {
    update({ workoutTemplates: data.workoutTemplates.filter(w => w.id !== id) });
  }

  function saveRunTemplate(tpl) {
    const templates = tpl.id
      ? data.runTemplates.map(r => r.id === tpl.id ? tpl : r)
      : [...data.runTemplates, { ...tpl, id: Date.now().toString() }];
    update({ runTemplates: templates });
  }

  function deleteRunTemplate(id) {
    update({ runTemplates: data.runTemplates.filter(r => r.id !== id) });
  }

  return {
    days: data.days,
    workoutTemplates: data.workoutTemplates,
    runTemplates: data.runTemplates,
    status,
    getDay,
    updateDay,
    addWorkoutToDay, addRunToDay,
    removeWorkoutFromDay, removeRunFromDay,
    saveWorkoutTemplate, deleteWorkoutTemplate,
    saveRunTemplate, deleteRunTemplate,
  };
}
