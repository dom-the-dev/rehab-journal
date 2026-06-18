import React, { useState } from 'react';
import { Btn, Input, Textarea, Modal } from './ui';
import { Plus, Trash2, Pencil, Dumbbell, ShieldPlus } from 'lucide-react';

const EMPTY_EXERCISE = { name: '', sets: '', reps: '', weight: '', note: '' };
const EMPTY_WORKOUT = { name: '', isRehab: false, exercises: [] };

export function WorkoutLibrary({ workoutTemplates, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);

  function openNew() { setEditing({ ...EMPTY_WORKOUT, exercises: [{ ...EMPTY_EXERCISE, id: Date.now().toString() }] }); }
  function openEdit(tpl) { setEditing({ ...tpl, exercises: tpl.exercises.map(e => ({ ...e })) }); }

  function addExercise() {
    setEditing(e => ({ ...e, exercises: [...e.exercises, { ...EMPTY_EXERCISE, id: Date.now().toString() }] }));
  }

  function updateExercise(index, field, value) {
    setEditing(e => {
      const exs = [...e.exercises];
      exs[index] = { ...exs[index], [field]: value };
      return { ...e, exercises: exs };
    });
  }

  function removeExercise(index) {
    setEditing(e => ({ ...e, exercises: e.exercises.filter((_, i) => i !== index) }));
  }

  function handleSave() {
    if (!editing.name.trim()) return;
    onSave(editing);
    setEditing(null);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Workout-Bibliothek</h2>
        <Btn onClick={openNew}><Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Neues Workout</Btn>
      </div>

      {workoutTemplates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
          <Dumbbell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <div style={{ fontSize: 14 }}>Noch keine Workouts. Erstelle dein erstes!</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {workoutTemplates.map(tpl => (
          <div key={tpl.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Dumbbell size={18} color="var(--brand)" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{tpl.name}</span>
                  {tpl.isRehab && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--brand)22', color: 'var(--brand)', borderRadius: 5, padding: '1px 6px', letterSpacing: 0.5 }}>
                      REHAB
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {tpl.exercises.length} Übung{tpl.exercises.length !== 1 ? 'en' : ''}
                  {tpl.exercises.length > 0 && ': ' + tpl.exercises.map(e => e.name).filter(Boolean).join(', ')}
                </div>
              </div>
              <button onClick={() => openEdit(tpl)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Pencil size={15} />
              </button>
              <button onClick={() => onDelete(tpl.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Workout bearbeiten' : 'Neues Workout'} onClose={() => setEditing(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Name des Workouts" value={editing.name} onChange={v => setEditing(e => ({ ...e, name: v }))} placeholder="z.B. Oberkörper A" />

            {/* Rehab toggle */}
            <button
              onClick={() => setEditing(e => ({ ...e, isRehab: !e.isRehab }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: editing.isRehab ? 'var(--brand)18' : 'var(--bg-4)',
                border: `1px solid ${editing.isRehab ? 'var(--brand)' : 'var(--border-light)'}`,
                borderRadius: 10, padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                background: editing.isRehab ? 'var(--brand)' : 'transparent',
                border: editing.isRehab ? 'none' : '2px solid var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {editing.isRehab && <span style={{ color: '#000', fontSize: 12, fontWeight: 900 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: editing.isRehab ? 'var(--brand)' : 'var(--text)' }}>
                  Rehab-Einheit
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Zählt für den 3-Tage-Rhythmus im Kalender
                </div>
              </div>
            </button>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Übungen</span>
                <Btn size="sm" variant="ghost" onClick={addExercise}><Plus size={12} style={{ display: 'inline', marginRight: 3 }} />Übung</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {editing.exercises.map((ex, i) => (
                  <div key={ex.id || i} style={{ background: 'var(--bg-4)', borderRadius: 10, padding: 12, position: 'relative' }}>
                    <button
                      onClick={() => removeExercise(i)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Input label="Bezeichnung" value={ex.name} onChange={v => updateExercise(i, 'name', v)} placeholder="z.B. Kniebeuge" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <Input label="Sätze" value={ex.sets} onChange={v => updateExercise(i, 'sets', v)} placeholder="3" />
                        <Input label="Wdh. / Sek." value={ex.reps} onChange={v => updateExercise(i, 'reps', v)} placeholder="10 / 30s" />
                        <Input label="Gewicht" value={ex.weight} onChange={v => updateExercise(i, 'weight', v)} placeholder="60kg" />
                      </div>
                      <Input label="Notiz" value={ex.note} onChange={v => updateExercise(i, 'note', v)} placeholder="Optional" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Btn>
              <Btn onClick={handleSave} disabled={!editing.name.trim()}>Speichern</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
