import React, { useState } from 'react';
import { Btn, Input, Modal } from './ui';
import { Plus, Trash2, Pencil, Footprints } from 'lucide-react';

const EMPTY_INTERVAL = { distance: '', pace: '' };
const EMPTY_RUN = { name: '', distance: '', pace: '', intervals: [] };

export function RunLibrary({ runTemplates, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);

  function openNew() { setEditing({ ...EMPTY_RUN, intervals: [] }); }
  function openEdit(tpl) { setEditing({ ...tpl, intervals: (tpl.intervals || []).map(iv => ({ ...iv })) }); }

  function addInterval() {
    setEditing(r => ({ ...r, intervals: [...r.intervals, { ...EMPTY_INTERVAL, id: Date.now().toString() }] }));
  }

  function updateInterval(index, field, value) {
    setEditing(r => {
      const ivs = [...r.intervals];
      ivs[index] = { ...ivs[index], [field]: value };
      return { ...r, intervals: ivs };
    });
  }

  function removeInterval(index) {
    setEditing(r => ({ ...r, intervals: r.intervals.filter((_, i) => i !== index) }));
  }

  function handleSave() {
    if (!editing.name.trim() || !editing.distance) return;
    onSave(editing);
    setEditing(null);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Lauf-Bibliothek</h2>
        <Btn onClick={openNew}><Plus size={14} style={{ display: 'inline', marginRight: 4 }} />Neuer Lauf</Btn>
      </div>

      {runTemplates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
          <Footprints size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <div style={{ fontSize: 14 }}>Noch keine Läufe. Erstelle deinen ersten!</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {runTemplates.map(tpl => (
          <div key={tpl.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Footprints size={18} color="#38bdf8" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{tpl.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {tpl.distance} km · {tpl.pace} min/km
                  {tpl.intervals?.length > 0 ? ` · ${tpl.intervals.length} Intervalle` : ''}
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
        <Modal title={editing.id ? 'Lauf bearbeiten' : 'Neuer Lauf'} onClose={() => setEditing(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Name des Laufs" value={editing.name} onChange={v => setEditing(r => ({ ...r, name: v }))} placeholder="z.B. Langer Dauerlauf" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Distanz (km)" type="number" value={editing.distance} onChange={v => setEditing(r => ({ ...r, distance: v }))} placeholder="10" min="0" step="0.1" />
              <Input label="Pace (min/km)" type="text" value={editing.pace} onChange={v => setEditing(r => ({ ...r, pace: v }))} placeholder="5:30" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Intervalle (optional)</span>
                <Btn size="sm" variant="ghost" onClick={addInterval}><Plus size={12} style={{ display: 'inline', marginRight: 3 }} />Intervall</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {editing.intervals.map((iv, i) => (
                  <div key={iv.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end', background: 'var(--bg-4)', borderRadius: 8, padding: 10 }}>
                    <Input label="Distanz (km)" type="number" value={iv.distance} onChange={v => updateInterval(i, 'distance', v)} placeholder="1" min="0" step="0.1" />
                    <Input label="Pace (min/km)" type="text" value={iv.pace} onChange={v => updateInterval(i, 'pace', v)} placeholder="4:30" />
                    <button onClick={() => removeInterval(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '8px 4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {editing.intervals.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>
                    Keine Intervalle — einfacher Dauerlauf
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Btn>
              <Btn onClick={handleSave} disabled={!editing.name.trim() || !editing.distance}>Speichern</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
