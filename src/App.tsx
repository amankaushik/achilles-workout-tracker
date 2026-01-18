import { useState, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useWorkoutStorage } from './hooks/useWorkoutStorage';
import { WORKOUT_DATA } from './data/workoutData';
import { ExerciseLog } from './types';

import Auth from './components/Auth';
import Header from './components/Header';
import SideNav from './components/SideNav';
import Toast from './components/Toast';
import PhaseSelection from './components/PhaseSelection';
import WeekSelection from './components/WeekSelection';
import WorkoutSelection from './components/WorkoutSelection';
import WorkoutPreview from './components/WorkoutPreview';
import WorkoutTracking from './components/WorkoutTracking';
import HistoryView from './components/HistoryView';
import HistoryDetail from './components/HistoryDetail';
import StatsView from './components/StatsView';

const VIEWS = {
  PHASE: 'phase',
  WEEK: 'week',
  WORKOUT: 'workout',
  WORKOUT_PREVIEW: 'workoutPreview',
  TRACKING: 'tracking',
  HISTORY: 'history',
  HISTORY_DETAIL: 'historyDetail',
  STATS: 'stats'
} as const;

type ViewType = typeof VIEWS[keyof typeof VIEWS];

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<ViewType>(VIEWS.PHASE);
  const [currentPhase, setCurrentPhase] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<number | null>(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);

  const {
    workoutLog,
    saveWorkout,
    deleteWorkout,
    getWorkout,
    hasWeekData,
    isLoading,
    syncError,
    refreshFromApi
  } = useWorkoutStorage();

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  const handleSaveWorkout = useCallback((exercises: ExerciseLog[], markComplete: boolean) => {
    if (currentPhase === null || currentWeek === null || currentWorkout === null) return;

    const key = `${currentPhase}-${currentWeek}-${currentWorkout}`;
    const existingEntry = getWorkout(key);
    const workout = WORKOUT_DATA[currentPhase].workouts[currentWorkout];
    const now = new Date().toISOString();

    saveWorkout(key, {
      phase: currentPhase,
      week: currentWeek,
      workoutNum: currentWorkout,
      workoutName: workout.name,
      focus: workout.focus,
      exercises,
      savedAt: now,
      completed: markComplete || (existingEntry?.completed || false),
      completedAt: markComplete ? now : (existingEntry?.completedAt || null)
    });

    // Only show toast and redirect when marking complete
    if (markComplete) {
      showToast('Workout completed!');
      setTimeout(() => {
        setView(VIEWS.WORKOUT);
      }, 500);
    }
  }, [currentPhase, currentWeek, currentWorkout, getWorkout, saveWorkout, showToast, setView]);

  // Show auth screen if not logged in (AFTER all hooks are called)
  if (authLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleSelectPhase = (phase: number) => {
    setCurrentPhase(phase);
    setView(VIEWS.WEEK);
  };

  const handleSelectWeek = (week: number) => {
    setCurrentWeek(week);
    setView(VIEWS.WORKOUT);
  };

  const handleSelectWorkout = (workout: number) => {
    setCurrentWorkout(workout);
    setView(VIEWS.WORKOUT_PREVIEW);
  };

  const handleStartWorkout = () => {
    setView(VIEWS.TRACKING);
  };

  const handleHistoryClick = async () => {
    setIsRefreshingHistory(true);
    setView(VIEWS.HISTORY);
    await refreshFromApi();
    setIsRefreshingHistory(false);
  };

  const handleStatsClick = () => {
    setView(VIEWS.STATS);
  };

  const handleSelectHistoryEntry = (key: string) => {
    setSelectedHistoryKey(key);
    setView(VIEWS.HISTORY_DETAIL);
  };

  const handleDeleteHistoryEntry = () => {
    if (selectedHistoryKey && window.confirm('Are you sure you want to delete this workout entry?')) {
      deleteWorkout(selectedHistoryKey);
      showToast('Entry deleted');
      setView(VIEWS.HISTORY);
    }
  };

  const handleBack = (toView: ViewType) => {
    setView(toView);
  };

  const renderView = () => {
    switch (view) {
      case VIEWS.PHASE:
        return <PhaseSelection onSelectPhase={handleSelectPhase} />;

      case VIEWS.WEEK:
        if (currentPhase === null) return null;
        return (
          <WeekSelection
            phase={currentPhase}
            hasWeekData={hasWeekData}
            onSelectWeek={handleSelectWeek}
            onBack={() => handleBack(VIEWS.PHASE)}
          />
        );

      case VIEWS.WORKOUT:
        if (currentPhase === null || currentWeek === null) return null;
        return (
          <WorkoutSelection
            phase={currentPhase}
            week={currentWeek}
            workoutLog={workoutLog}
            onSelectWorkout={handleSelectWorkout}
            onBack={() => handleBack(VIEWS.WEEK)}
          />
        );

      case VIEWS.WORKOUT_PREVIEW:
        if (currentPhase === null || currentWeek === null || currentWorkout === null) return null;
        return (
          <WorkoutPreview
            phase={currentPhase}
            week={currentWeek}
            workoutNum={currentWorkout}
            onStartWorkout={handleStartWorkout}
            onBack={() => handleBack(VIEWS.WORKOUT)}
          />
        );

      case VIEWS.TRACKING:
        if (currentPhase === null || currentWeek === null || currentWorkout === null) return null;
        const key = `${currentPhase}-${currentWeek}-${currentWorkout}`;
        return (
          <WorkoutTracking
            phase={currentPhase}
            week={currentWeek}
            workoutNum={currentWorkout}
            existingData={getWorkout(key)}
            onSave={handleSaveWorkout}
            onBack={() => handleBack(VIEWS.WORKOUT_PREVIEW)}
          />
        );

      case VIEWS.HISTORY:
        return (
          <HistoryView
            workoutLog={workoutLog}
            onSelectEntry={handleSelectHistoryEntry}
            onBack={() => handleBack(VIEWS.PHASE)}
            isRefreshing={isRefreshingHistory}
          />
        );

      case VIEWS.HISTORY_DETAIL:
        if (!selectedHistoryKey || !workoutLog[selectedHistoryKey]) return null;
        return (
          <HistoryDetail
            data={workoutLog[selectedHistoryKey]}
            onDelete={handleDeleteHistoryEntry}
            onBack={() => handleBack(VIEWS.HISTORY)}
          />
        );

      case VIEWS.STATS:
        return <StatsView onBack={() => handleBack(VIEWS.PHASE)} />;

      default:
        return <PhaseSelection onSelectPhase={handleSelectPhase} />;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="app-layout">
          <SideNav onHistoryClick={handleHistoryClick} onStatsClick={handleStatsClick} />
          <main className="main-content">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Loading workout data...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="app-layout">
        <SideNav onHistoryClick={handleHistoryClick} onStatsClick={handleStatsClick} />
        <main className="main-content">
          {syncError && (
            <div style={{ padding: '0.5rem', backgroundColor: '#ff6b6b', color: 'white', textAlign: 'center' }}>
              {syncError}
            </div>
          )}
          {renderView()}
        </main>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
