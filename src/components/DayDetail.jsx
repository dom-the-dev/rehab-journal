import React, { useState } from 'react';
import { formatDate, painColor, toDateKey } from '../utils';
import { PainScale } from './PainScale';
import { Btn, Input, Textarea, Modal } from './ui';
import { Plus, Trash2, Dumbbell, Footprints, Pencil, Check, Globe, ChevronLeft, ChevronRight, Moon, StickyNote } from 'lucide-react';

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

function WorkoutCard({ entry, onRemove, onUpdateEntry, onSaveGlobal }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [exercises, setExercises] = useState(entry.exercises);
  const [saved, setSaved] = useState(false);

  function updateEx(i, field, value) {
    setExercises(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function commitLocal() {
    onUpdateEntry({ ...entry, exercises });
    setEditing(false);
  }

  function commitGlobal() {
    onUpdateEntry({ ...entry, exercises });
    onSaveGlobal({ ...entry, exercises });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function cancelEdit() {
    setExercises(entry.exercises);
    setEditing(false);
  }

  return (
    <div style={{ background: 'var(--bg-4)', border: '1px solid var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <Dumbbell size={16} color="var(--brand)" />
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{entry.name}</span>
        {saved && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ Global gespeichert</span>}
        <button
          onClick={() => { setOpen(o => !o); if (!open) setEditing(false); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
        >
          {open ? 'Einklappen' : `${entry.exercises.length} Übungen`}
        </button>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>
          <Trash2 size={14} />
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px' }}>
          {!editing ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', fontWeight: 500 }}>Übung</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500 }}>Sätze</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500 }}>Wdh./Sek.</th>
                    <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500 }}>Gewicht</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.exercises.map((ex, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px 6px 0' }}>
                        <div>{ex.name}</div>
                        {ex.note && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ex.note}</div>}
                      </td>
                      <td style={{ textAlign: 'center', padding: '6px 8px' }}>{ex.sets || '—'}</td>
                      <td style={{ textAlign: 'center', padding: '6px 8px' }}>{ex.reps || '—'}</td>
                      <td style={{ textAlign: 'center', padding: '6px 8px' }}>{ex.weight || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <Btn size="sm" variant="ghost" onClick={() => { setExercises(entry.exercises); setEditing(true); }}>
                  <Pencil size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Bearbeiten
                </Btn>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map((ex, i) => (
                <div key={i} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text)' }}>{ex.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <Input label="Sätze" value={ex.sets} onChange={v => updateEx(i, 'sets', v)} placeholder="3" />
                    <Input label="Wdh. / Sek." value={ex.reps} onChange={v => updateEx(i, 'reps', v)} placeholder="10 / 30s" />
                    <Input label="Gewicht" value={ex.weight} onChange={v => updateEx(i, 'weight', v)} placeholder="60kg" />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Input label="Notiz" value={ex.note} onChange={v => updateEx(i, 'note', v)} placeholder="Optional" />
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
                <Btn size="sm" variant="ghost" onClick={cancelEdit}>Abbrechen</Btn>
                <Btn size="sm" variant="secondary" onClick={commitLocal}>
                  <Check size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Nur heute
                </Btn>
                <Btn size="sm" onClick={commitGlobal}>
                  <Globe size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Global speichern
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RunCard({ entry, onRemove }) {
  return (
    <div style={{ background: 'var(--bg-4)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Footprints size={16} color="#38bdf8" />
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{entry.name}</span>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>
          <Trash2 size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#38bdf8' }}>{entry.distance}</span>
          <span style={{ marginLeft: 3 }}>km</span>
        </div>
        {entry.pace && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{entry.pace}</span>
            <span style={{ marginLeft: 3 }}>min/km</span>
          </div>
        )}
      </div>
      {entry.intervals?.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {entry.intervals.map((iv, i) => (
            <span key={i} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#38bdf8' }}>
              {iv.distance}km @ {iv.pace}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DayDetail({ dateKey, dayData, workoutTemplates, runTemplates, onUpdateDay, onAddWorkout, onAddRun, onRemoveWorkout, onRemoveRun, onSaveWorkoutTemplate, onNavigate, nextRunDate, nextRehabDate }) {
  const [addModal, setAddModal] = useState(null);

  function updateWorkoutEntry(entryId, updated) {
    const workouts = dayData.workouts.map(w => w.id === entryId ? updated : w);
    onUpdateDay({ workouts });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Date header with prev/next */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <PainBadge label="WB" value={dayData.wb} />
          <PainBadge label="S1" value={dayData.s1} />
          <PainBadge label="S2" value={dayData.s2} />
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
      </div>

      {/* Due-date banners */}
      {(dateKey === nextRunDate || dateKey === nextRehabDate) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dateKey === nextRunDate && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#38bdf815', border: '1px solid #38bdf840',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <Footprints size={16} color="#38bdf8" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>Lauf fällig heute</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Letzter Lauf war vor 3 Tagen</div>
              </div>
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

      {/* WB + S2 – Tagesverlauf */}
      <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14, padding: 18 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Tagesverlauf
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <PainScale label="WB – Wohlbefinden während Übung" value={dayData.wb} onChange={v => onUpdateDay({ wb: v })} />
          <div style={{ borderTop: '1px solid var(--border)' }} />
          <PainScale label="S2 – Wohlbefinden danach" sublabel="(nach Training)" value={dayData.s2} onChange={v => onUpdateDay({ s2: v })} />
        </div>
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
          <Btn size="sm" onClick={() => setAddModal('run')}>
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
            <RunCard key={entry.id} entry={entry} onRemove={() => onRemoveRun(entry.id)} />
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
        <Modal title="Workout hinzufügen" onClose={() => setAddModal(null)}>
          {workoutTemplates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Keine Workouts definiert. Erstelle erst Workout-Vorlagen in der Bibliothek.
            </p>
          ) : (
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
          )}
        </Modal>
      )}

      {addModal === 'run' && (
        <Modal title="Lauf hinzufügen" onClose={() => setAddModal(null)}>
          {runTemplates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              Keine Läufe definiert. Erstelle erst Lauf-Vorlagen in der Bibliothek.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {runTemplates.map(tpl => (
                <button key={tpl.id} onClick={() => { onAddRun(tpl.id); setAddModal(null); }} style={{
                  background: 'var(--bg-4)', border: '1px solid var(--border-light)',
                  borderRadius: 10, padding: '12px 16px', color: 'var(--text)', textAlign: 'left', cursor: 'pointer',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{tpl.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {tpl.distance} km · {tpl.pace} min/km
                    {tpl.intervals?.length > 0 ? ` · ${tpl.intervals.length} Intervalle` : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
