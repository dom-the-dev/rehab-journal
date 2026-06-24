import React, { useState, useRef } from 'react';
import { formatDate, painColor, toDateKey } from '../utils';
import { useIsMobile } from '../hooks/useIsMobile';
import { PainScale } from './PainScale';
import { Btn, Input, Textarea, Modal } from './ui';
import { Plus, Trash2, Dumbbell, Footprints, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Moon, StickyNote } from 'lucide-react';

function offsetDate(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return toDateKey(date);
}

function PainBadge({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-4)', borderRadius: 8, padding: '4px 10px' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 800, color: painColor(value) }}>{value}</span>
    </div>
  );
}

function parseSets(setsStr) {
  const n = parseInt(setsStr);
  return isNaN(n) || n < 1 ? 1 : Math.min(n, 20);
}

function WorkoutCard({ entry, onRemove, onUpdateEntry, onSaveGlobal }) {
  const [open, setOpen] = useState(true);
  const debounceRef = useRef(null);

  const checked = entry.setsChecked || {};
  const totalSets = entry.exercises.reduce((s, ex) => s + parseSets(ex.sets), 0);
  const doneSets = Object.values(checked).reduce((s, n) => s + n, 0);
  const completedExCount = entry.exercises.filter((ex, i) => (checked[i] || 0) >= parseSets(ex.sets)).length;
  const workoutDone = completedExCount === entry.exercises.length && entry.exercises.length > 0;
  const progress = totalSets > 0 ? doneSets / totalSets : 0;

  function toggleSet(exIndex, setIndex) {
    const exSets = parseSets(entry.exercises[exIndex]?.sets);
    const current = checked[exIndex] || 0;
    const next = setIndex < current ? setIndex : setIndex + 1;
    const updated = { ...entry, setsChecked: { ...checked, [exIndex]: Math.min(next, exSets) } };
    onUpdateEntry(updated);
  }

  function updateEx(exIdx, field, value) {
    const exercises = entry.exercises.map((ex, i) => i === exIdx ? { ...ex, [field]: value } : ex);
    const updated = { ...entry, exercises };
    onUpdateEntry(updated);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSaveGlobal({ ...updated, id: updated.templateId }), 800);
  }

  return (
    <div style={{
      background: 'var(--bg-4)',
      border: `1px solid ${workoutDone ? 'var(--green)' : 'var(--border-light)'}`,
      borderRadius: 12, overflow: 'hidden',
      transition: 'border-color 0.3s',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: progress > 0 ? 10 : 0 }}>
          <Dumbbell size={16} color={workoutDone ? 'var(--green)' : 'var(--brand)'} />
          <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{entry.name}</span>
          {workoutDone && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ Fertig!</span>}
          <button onClick={() => setOpen(o => !o)} style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-3)', color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={onRemove} style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--red)44',
            background: 'var(--red)11', color: 'var(--red)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}>
            <Trash2 size={16} />
          </button>
        </div>
        {(progress > 0 || workoutDone) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: workoutDone ? 'var(--green)' : 'var(--brand)', width: `${Math.round(progress * 100)}%`, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{doneSets}/{totalSets} Sätze</span>
          </div>
        )}
      </div>

      {/* Exercises — always editable */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {entry.exercises.map((ex, exIdx) => {
            const setCount = parseSets(ex.sets);
            const done = checked[exIdx] || 0;
            const exDone = done >= setCount;
            return (
              <div key={exIdx} style={{
                padding: '14px 14px',
                borderBottom: exIdx < entry.exercises.length - 1 ? '1px solid var(--border)' : 'none',
                background: exDone ? '#22c55e0a' : 'transparent',
                transition: 'background 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: exDone ? 'var(--green)' : 'var(--text)',
                    textDecoration: exDone ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>{ex.name}</span>
                  {exDone && <Check size={16} color="var(--green)" />}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <Input label="Sätze" value={ex.sets} onChange={v => updateEx(exIdx, 'sets', v)} placeholder="3" />
                  <Input label="Wdh. / Sek." value={ex.reps} onChange={v => updateEx(exIdx, 'reps', v)} placeholder="10 / 30s" />
                  <Input label="Gewicht" value={ex.weight} onChange={v => updateEx(exIdx, 'weight', v)} placeholder="60kg" />
                </div>
                {(ex.note !== undefined) && (
                  <div style={{ marginBottom: 12 }}>
                    <Input label="Notiz" value={ex.note || ''} onChange={v => updateEx(exIdx, 'note', v)} placeholder="Optional" />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Array.from({ length: setCount }, (_, si) => {
                    const isChecked = si < done;
                    return (
                      <button key={si} onClick={() => toggleSet(exIdx, si)} style={{
                        width: 44, height: 44, borderRadius: '50%',
                        border: `2px solid ${isChecked ? 'var(--green)' : 'var(--border-light)'}`,
                        background: isChecked ? 'var(--green)' : 'transparent',
                        color: isChecked ? '#000' : 'var(--text-muted)',
                        fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        WebkitTapHighlightColor: 'transparent', flexShrink: 0,
                      }}>
                        {isChecked ? <Check size={16} /> : si + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* WB + S2 per workout */}
          <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PainScale label="WB – Wohlbefinden während Workout" value={entry.wb ?? null} onChange={v => onUpdateEntry({ ...entry, wb: v })} />
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <PainScale label="S2 – Wohlbefinden danach" sublabel="(nach Training)" value={entry.s2 ?? null} onChange={v => onUpdateEntry({ ...entry, s2: v })} />
          </div>
        </div>
      )}
    </div>
  );
}

function calcPace(km, timeStr) {
  if (!km || !timeStr) return '';
  const [m, s] = timeStr.includes(':') ? timeStr.split(':').map(Number) : [Number(timeStr), 0];
  const totalMin = m + (s || 0) / 60;
  const pace = Number(km) > 0 ? totalMin / Number(km) : null;
  if (!pace) return '';
  return `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}`;
}

function RunCard({ entry, onRemove, onUpdateEntry }) {
  const [open, setOpen] = useState(true);

  function update(field, value) {
    const updated = { ...entry, [field]: value };
    if (field === 'distance' || field === 'time') {
      updated.pace = calcPace(
        field === 'distance' ? value : entry.distance,
        field === 'time' ? value : entry.time,
      );
      updated.name = `${field === 'distance' ? value : entry.distance} km Lauf`;
    }
    onUpdateEntry(updated);
  }

  const pace = entry.pace || calcPace(entry.distance, entry.time);

  return (
    <div style={{ background: 'var(--bg-4)', border: '1px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Footprints size={16} color="#38bdf8" />
        <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{entry.name}</span>
        <button onClick={() => setOpen(o => !o)} style={{
          width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--bg-3)', color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={onRemove} style={{
          width: 36, height: 36, borderRadius: 8, border: '1px solid var(--red)44',
          background: 'var(--red)11', color: 'var(--red)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        }}>
          <Trash2 size={16} />
        </button>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Editable fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Distanz (km)" value={entry.distance || ''} onChange={v => update('distance', v)} placeholder="5.2" type="number" />
            <Input label="Zeit (mm:ss)" value={entry.time || ''} onChange={v => update('time', v)} placeholder="25:30" />
          </div>
          {/* Stats summary */}
          {pace && (
            <div style={{
              background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '10px 14px', display: 'flex', gap: 20,
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 1 }}>Distanz</div>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#38bdf8' }}>{entry.distance}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>km</span>
              </div>
              {entry.time && <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 1 }}>Zeit</div>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{entry.time}</span>
              </div>}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 1 }}>Pace</div>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--green)' }}>{pace}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>min/km</span>
              </div>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PainScale label="WB – Wohlbefinden während Lauf" value={entry.wb ?? null} onChange={v => onUpdateEntry({ ...entry, wb: v })} />
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <PainScale label="S2 – Wohlbefinden danach" sublabel="(nach Lauf)" value={entry.s2 ?? null} onChange={v => onUpdateEntry({ ...entry, s2: v })} />
          </div>
        </div>
      )}
    </div>
  );
}

function RunForm({ onAdd, onClose }) {
  const [km, setKm] = useState('');
  const [time, setTime] = useState('');

  const totalMin = (() => {
    if (!time) return null;
    const [m, s] = time.includes(':') ? time.split(':').map(Number) : [Number(time), 0];
    return m + (s || 0) / 60;
  })();
  const pace = totalMin && Number(km) > 0 ? totalMin / Number(km) : null;
  const paceStr = pace
    ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}`
    : null;

  function handleAdd() {
    if (!km || !time) return;
    onAdd({ km: Number(km), timeStr: time });
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      alignItems: 'center',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: '#00000066' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 600,
        background: 'var(--bg-2)', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 36px', display: 'flex', flexDirection: 'column', gap: 20,
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Footprints size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Lauf eintragen</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Distanz (km)" value={km} onChange={setKm} placeholder="5.2" type="number" />
          <Input label="Zeit (mm:ss)" value={time} onChange={setTime} placeholder="25:30" />
        </div>

        {paceStr && (
          <div style={{
            background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '12px 16px', display: 'flex', gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Distanz</div>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#38bdf8' }}>{km}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 3 }}>km</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Zeit</div>
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>{time}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Pace</div>
              <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--green)' }}>{paceStr}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 3 }}>min/km</span>
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!km || !time}
          style={{
            background: !km || !time ? 'var(--bg-4)' : 'var(--brand)',
            color: !km || !time ? 'var(--text-dim)' : '#000',
            border: 'none', borderRadius: 12, padding: '14px 0',
            fontWeight: 700, fontSize: 15, cursor: !km || !time ? 'default' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Lauf speichern
        </button>
      </div>
    </div>
  );
}

export function DayDetail({ dateKey, dayData, workoutTemplates, onUpdateDay, onAddWorkout, onAddCustomWorkout, onAddRun, onRemoveWorkout, onRemoveRun, onSaveWorkoutTemplate, onNavigate, nextRunDate, nextRehabDate, runRec }) {
  const [addModal, setAddModal] = useState(null);
  const [showRunForm, setShowRunForm] = useState(false);
  const [customWorkoutName, setCustomWorkoutName] = useState('');

  function updateWorkoutEntry(entryId, updated) {
    const workouts = dayData.workouts.map(w => w.id === entryId ? updated : w);
    onUpdateDay({ workouts });
  }

  function updateRunEntry(entryId, updated) {
    const runs = dayData.runs.map(r => r.id === entryId ? updated : r);
    onUpdateDay({ runs });
  }

  const isMobile = useIsMobile();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Date header — desktop only (mobile nav is handled by App.jsx sticky bar) */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => onNavigate(offsetDate(dateKey, -1))} style={{
            background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center',
          }}>
            <ChevronLeft size={16} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 800, flex: 1, textAlign: 'center' }}>
            {formatDate(dateKey)}
          </h1>
          <button onClick={() => onNavigate(offsetDate(dateKey, 1))} style={{
            background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center',
          }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Day summary badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <PainBadge label="S1" value={dayData.s1} />
        {dayData.workouts?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-4)', borderRadius: 8, padding: '4px 10px' }}>
            <Dumbbell size={12} color="var(--brand)" />
            <span style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>{dayData.workouts.length}x Workout</span>
          </div>
        )}
        {dayData.runs?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-4)', borderRadius: 8, padding: '4px 10px' }}>
            <Footprints size={12} color="#38bdf8" />
            <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>{dayData.runs.length}x Lauf</span>
          </div>
        )}
      </div>

      {/* Due-date banners */}
      {(dateKey === nextRunDate || dateKey === nextRehabDate) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dateKey === nextRunDate && (
            <div style={{
              background: '#38bdf815', border: '1px solid #38bdf840',
              borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Footprints size={16} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>Lauf fällig heute</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Letzter Lauf war vor 3 Tagen</div>
                </div>
              </div>
              {runRec && (
                <div style={{ marginLeft: 26, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: runRec.color,
                    background: runRec.color + '18', borderRadius: 6, padding: '4px 8px',
                    alignSelf: 'flex-start',
                  }}>
                    {runRec.label}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      WB letzter Lauf:{' '}
                      <span style={{ fontWeight: 700, color: runRec.wb !== null ? (runRec.wb <= 3 ? 'var(--green)' : runRec.wb <= 5 ? 'var(--orange)' : 'var(--red)') : 'var(--text-dim)' }}>
                        {runRec.wb !== null ? runRec.wb : '–'}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      S1 seitdem max:{' '}
                      <span style={{ fontWeight: 700, color: runRec.maxS1 !== null ? (runRec.maxS1 <= 3 ? 'var(--green)' : runRec.maxS1 <= 5 ? 'var(--orange)' : 'var(--red)') : 'var(--text-dim)' }}>
                        {runRec.maxS1 !== null ? runRec.maxS1 : '–'}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          {dateKey === nextRehabDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--brand)15', border: '1px solid var(--brand)40',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <Dumbbell size={16} color="var(--brand)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>Rehab-Workout fällig heute</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Letztes Rehab-Workout war vor 3 Tagen</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* S1 – Morgens (visually separated, refers to previous night) */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid #2a3a4a', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Moon size={14} color="#60a5fa" />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 1 }}>
            Morgens
          </h3>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 2 }}>
            — bezieht sich auf die Nacht zuvor
          </span>
        </div>
        <PainScale label="S1 – Wohlbefinden morgens" value={dayData.s1} onChange={v => onUpdateDay({ s1: v })} />
      </div>

      {/* Workouts */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Workouts</h3>
          <Btn size="sm" onClick={() => setAddModal('workout')}>
            <Plus size={12} style={{ display: 'inline', marginRight: 4 }} />Hinzufügen
          </Btn>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!dayData.workouts?.length && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, padding: '24px 0' }}>
              Noch kein Workout für diesen Tag
            </div>
          )}
          {dayData.workouts?.map(entry => (
            <WorkoutCard
              key={entry.id}
              entry={entry}
              onRemove={() => onRemoveWorkout(entry.id)}
              onUpdateEntry={updated => updateWorkoutEntry(entry.id, updated)}
              onSaveGlobal={updated => onSaveWorkoutTemplate({ ...updated, id: updated.templateId })}
            />
          ))}
        </div>
      </div>

      {/* Runs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Läufe</h3>
          <Btn size="sm" onClick={() => setShowRunForm(true)}>
            <Plus size={12} style={{ display: 'inline', marginRight: 4 }} />Hinzufügen
          </Btn>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!dayData.runs?.length && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 13, padding: '24px 0' }}>
              Noch kein Lauf für diesen Tag
            </div>
          )}
          {dayData.runs?.map(entry => (
            <RunCard key={entry.id} entry={entry} onRemove={() => onRemoveRun(entry.id)} onUpdateEntry={updated => updateRunEntry(entry.id, updated)} />
          ))}
        </div>
      </div>

      {/* Schritte */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Footprints size={14} color="var(--text-muted)" />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Schritte</h3>
          </div>
          {dayData.steps && (
            <span style={{ fontSize: 20, fontWeight: 800, color: Number(dayData.steps) >= 8000 ? 'var(--green)' : Number(dayData.steps) >= 5000 ? 'var(--brand)' : 'var(--text-muted)' }}>
              {Number(dayData.steps).toLocaleString('de-DE')}
            </span>
          )}
        </div>
        <Input
          type="number"
          value={dayData.steps || ''}
          onChange={v => onUpdateDay({ steps: v })}
          placeholder="z.B. 8000"
          min="0"
        />
      </div>

      {/* Notiz */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <StickyNote size={14} color="var(--brand)" />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Notiz</h3>
        </div>
        <Textarea
          value={dayData.note || ''}
          onChange={v => onUpdateDay({ note: v })}
          placeholder="Notizen, Erinnerungen, Beobachtungen…"
          rows={3}
        />
      </div>

      {/* Add Modals */}
      {addModal === 'workout' && (
        <Modal title="Workout hinzufügen" onClose={() => { setAddModal(null); setCustomWorkoutName(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Quick custom entry */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={customWorkoutName}
                  onChange={setCustomWorkoutName}
                  placeholder="Eigener Name, z.B. Lower Body"
                />
              </div>
              <button
                onClick={() => {
                  if (!customWorkoutName.trim()) return;
                  onAddCustomWorkout(customWorkoutName.trim());
                  setAddModal(null);
                  setCustomWorkoutName('');
                }}
                disabled={!customWorkoutName.trim()}
                style={{
                  padding: '0 16px', borderRadius: 10, border: 'none',
                  background: customWorkoutName.trim() ? 'var(--brand)' : 'var(--bg-4)',
                  color: customWorkoutName.trim() ? '#000' : 'var(--text-dim)',
                  fontWeight: 700, fontSize: 13, cursor: customWorkoutName.trim() ? 'pointer' : 'default',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                + Hinzufügen
              </button>
            </div>

            {workoutTemplates.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>oder aus Bibliothek</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {workoutTemplates.map(tpl => (
                    <button key={tpl.id} onClick={() => { onAddWorkout(tpl.id); setAddModal(null); }} style={{
                      background: 'var(--bg-4)', border: '1px solid var(--border-light)',
                      borderRadius: 10, padding: '12px 16px', color: 'var(--text)', textAlign: 'left', cursor: 'pointer',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{tpl.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tpl.exercises.length} Übungen</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {showRunForm && (
        <RunForm onAdd={onAddRun} onClose={() => setShowRunForm(false)} />
      )}
    </div>
  );
}
