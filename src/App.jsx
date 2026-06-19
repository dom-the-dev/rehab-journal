import React, { useState } from 'react';
import { useStore } from './store';
import { today, getNextDueDate } from './utils';
import { Calendar } from './components/Calendar';
import { DayDetail } from './components/DayDetail';
import { WorkoutLibrary } from './components/WorkoutLibrary';
import { RunLibrary } from './components/RunLibrary';
import { useIsMobile } from './hooks/useIsMobile';
import { Activity, Dumbbell, Footprints, CalendarDays, Cloud, CloudOff, Loader, ChevronLeft } from 'lucide-react';
import { RehabInfo } from './components/RehabInfo';
import { Stats } from './components/Stats';

import { BarChart2 } from 'lucide-react';

const NAV = [
  { id: 'journal', label: 'Journal', icon: CalendarDays },
  { id: 'stats', label: 'Statistik', icon: BarChart2 },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'runs', label: 'Läufe', icon: Footprints },
];

function SyncIndicator({ status }) {
  const icon = {
    loading: <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />,
    saving:  <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />,
    ok:      <Cloud size={13} />,
    error:   <CloudOff size={13} color="var(--red)" />,
  }[status];
  const label = { loading: 'Lädt…', saving: 'Speichert…', ok: 'Synced', error: 'Offline' }[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: status === 'error' ? 'var(--red)' : 'var(--text-dim)' }}>
      {icon} {label}
    </div>
  );
}

export default function App() {
  const store = useStore();
  const isMobile = useIsMobile();
  const [view, setView] = useState('journal');
  const [selectedDay, setSelectedDay] = useState(today());
  const [mobileScreen, setMobileScreen] = useState('day'); // 'calendar' | 'day'

  const dayData = store.getDay(selectedDay);
  const nextRunDate = getNextDueDate(store.days, store.workoutTemplates, 'run');
  const nextRehabDate = getNextDueDate(store.days, store.workoutTemplates, 'rehab');

  function handleSelectDay(dateKey) {
    setSelectedDay(dateKey);
    if (isMobile) setMobileScreen('day');
  }

  // ── Desktop layout ────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
          padding: '0 20px', display: 'flex', alignItems: 'center', height: 56,
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Activity size={20} color="var(--brand)" />
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>
              Rehab<span style={{ color: 'var(--brand)' }}>Journal</span>
            </span>
          </div>
          <SyncIndicator status={store.status} />
          <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setView(id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: view === id ? 'var(--brand)' : 'transparent',
                color: view === id ? '#000' : 'var(--text-muted)',
                fontWeight: view === id ? 700 : 400,
                fontSize: 13, cursor: 'pointer', transition: 'all 0.12s',
              }}>
                <Icon size={14} /><span>{label}</span>
              </button>
            ))}
          </nav>
        </header>
        <main style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '24px 20px' }}>
          {view === 'journal' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, alignItems: 'start' }}>
              <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Calendar days={store.days} selectedDay={selectedDay} onSelectDay={handleSelectDay} nextRunDate={nextRunDate} nextRehabDate={nextRehabDate} />
                <RehabInfo />
              </div>
              <DayDetail
                dateKey={selectedDay} dayData={dayData}
                workoutTemplates={store.workoutTemplates} runTemplates={store.runTemplates}
                onUpdateDay={patch => store.updateDay(selectedDay, patch)}
                onAddWorkout={id => store.addWorkoutToDay(selectedDay, id)}
                onAddRun={id => store.addRunToDay(selectedDay, id)}
                onRemoveWorkout={id => store.removeWorkoutFromDay(selectedDay, id)}
                onRemoveRun={id => store.removeRunFromDay(selectedDay, id)}
                onSaveWorkoutTemplate={store.saveWorkoutTemplate}
                onNavigate={setSelectedDay}
                nextRunDate={nextRunDate}
                nextRehabDate={nextRehabDate}
              />
            </div>
          )}
          {view === 'stats' && <Stats days={store.days} workoutTemplates={store.workoutTemplates} />}
          {view === 'workouts' && <WorkoutLibrary workoutTemplates={store.workoutTemplates} onSave={store.saveWorkoutTemplate} onDelete={store.deleteWorkoutTemplate} />}
          {view === 'runs' && <RunLibrary runTemplates={store.runTemplates} onSave={store.saveRunTemplate} onDelete={store.deleteRunTemplate} />}
        </main>
      </div>
    );
  }

  // ── Mobile layout ─────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', paddingBottom: 64 }}>
      {/* Mobile header */}
      <header style={{
        background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
        padding: '0 16px', display: 'flex', alignItems: 'center', height: 52,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {view === 'journal' && mobileScreen === 'day' ? (
          <button onClick={() => setMobileScreen('calendar')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <Activity size={18} color="var(--brand)" />
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.5px', marginLeft: 6, flex: 1 }}>
          Rehab<span style={{ color: 'var(--brand)' }}>Journal</span>
        </span>
        <SyncIndicator status={store.status} />
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {view === 'journal' && mobileScreen === 'calendar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Calendar days={store.days} selectedDay={null} onSelectDay={handleSelectDay} nextRunDate={nextRunDate} nextRehabDate={nextRehabDate} />
            <RehabInfo />
          </div>
        )}
        {view === 'journal' && mobileScreen === 'day' && (
          <DayDetail
            dateKey={selectedDay} dayData={dayData}
            workoutTemplates={store.workoutTemplates} runTemplates={store.runTemplates}
            onUpdateDay={patch => store.updateDay(selectedDay, patch)}
            onAddWorkout={id => store.addWorkoutToDay(selectedDay, id)}
            onAddRun={id => store.addRunToDay(selectedDay, id)}
            onRemoveWorkout={id => store.removeWorkoutFromDay(selectedDay, id)}
            onRemoveRun={id => store.removeRunFromDay(selectedDay, id)}
            onSaveWorkoutTemplate={store.saveWorkoutTemplate}
            onNavigate={setSelectedDay}
            nextRunDate={nextRunDate}
            nextRehabDate={nextRehabDate}
          />
        )}
        {view === 'stats' && <Stats days={store.days} workoutTemplates={store.workoutTemplates} />}
        {view === 'workouts' && <WorkoutLibrary workoutTemplates={store.workoutTemplates} onSave={store.saveWorkoutTemplate} onDelete={store.deleteWorkoutTemplate} />}
        {view === 'runs' && <RunLibrary runTemplates={store.runTemplates} onSave={store.saveRunTemplate} onDelete={store.deleteRunTemplate} />}
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-2)', borderTop: '1px solid var(--border)',
        display: 'flex', height: 64,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button key={id} onClick={() => { setView(id); if (id === 'journal') setMobileScreen('calendar'); }} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, background: 'none', border: 'none', cursor: 'pointer',
              color: active ? 'var(--brand)' : 'var(--text-dim)',
            }}>
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
