import { useState, useCallback } from 'react';
import { useWorkoutStorage } from './hooks/useWorkoutStorage';
import { WORKOUT_DATA } from './data/workoutData';

import Header from './components/Header';
import Toast from './components/Toast';
import PhaseSelection from './components/PhaseSelection';
import WeekSelection from './components/WeekSelection';
import WorkoutSelection from './components/WorkoutSelection';
import WorkoutTracking from './components/WorkoutTracking';
import HistoryView from './components/HistoryView';
import HistoryDetail from './components/HistoryDetail';

const VIEWS = {
  PHASE: 'phase',
  WEEK: 'week',
  WORKOUT: 'workout',
  TRACKING: 'tracking',
  HISTORY: 'history',
  HISTORY_DETAIL: 'historyDetail'
};

export default function App() {
  const [view, setView] = useState(VIEWS.PHASE);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState(null);
  const [toast, setToast] = useState(null);

  const {
    workoutLog,
    saveWorkout,
    deleteWorkout,
    getWorkout,
    hasWeekData
  } = useWorkoutStorage();

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const handleSelectPhase = (phase) => {
    setCurrentPhase(phase);
    setView(VIEWS.WEEK);
  };

  const handleSelectWeek = (week) => {
    setCurrentWeek(week);
    setView(VIEWS.WORKOUT);
  };

  const handleSelectWorkout = (workout) => {
    setCurrentWorkout(workout);
    setView(VIEWS.TRACKING);
  };

  const handleSaveWorkout = (exercises, markComplete) => {
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

    showToast(markComplete ? 'Workout completed!' : 'Progress saved!');

    setTimeout(() => {
      setView(VIEWS.WORKOUT);
    }, 500);
  };

  const handleHistoryClick = () => {
    setView(VIEWS.HISTORY);
  };

  const handleSelectHistoryEntry = (key) => {
    setSelectedHistoryKey(key);
    setView(VIEWS.HISTORY_DETAIL);
  };

  const handleDeleteHistoryEntry = () => {
    if (window.confirm('Are you sure you want to delete this workout entry?')) {
      deleteWorkout(selectedHistoryKey);
      showToast('Entry deleted');
      setView(VIEWS.HISTORY);
    }
  };

  const handleBack = (toView) => {
    setView(toView);
  };

  const renderView = () => {
    switch (view) {
      case VIEWS.PHASE:
        return <PhaseSelection onSelectPhase={handleSelectPhase} />;

      case VIEWS.WEEK:
        return (
          <WeekSelection
            phase={currentPhase}
            hasWeekData={hasWeekData}
            onSelectWeek={handleSelectWeek}
            onBack={() => handleBack(VIEWS.PHASE)}
          />
        );

      case VIEWS.WORKOUT:
        return (
          <WorkoutSelection
            phase={currentPhase}
            week={currentWeek}
            workoutLog={workoutLog}
            onSelectWorkout={handleSelectWorkout}
            onBack={() => handleBack(VIEWS.WEEK)}
          />
        );

      case VIEWS.TRACKING:
        const key = `${currentPhase}-${currentWeek}-${currentWorkout}`;
        return (
          <WorkoutTracking
            phase={currentPhase}
            week={currentWeek}
            workoutNum={currentWorkout}
            existingData={getWorkout(key)}
            onSave={handleSaveWorkout}
            onBack={() => handleBack(VIEWS.WORKOUT)}
          />
        );

      case VIEWS.HISTORY:
        return (
          <HistoryView
            workoutLog={workoutLog}
            onSelectEntry={handleSelectHistoryEntry}
            onBack={() => handleBack(VIEWS.PHASE)}
          />
        );

      case VIEWS.HISTORY_DETAIL:
        return (
          <HistoryDetail
            data={workoutLog[selectedHistoryKey]}
            onDelete={handleDeleteHistoryEntry}
            onBack={() => handleBack(VIEWS.HISTORY)}
          />
        );

      default:
        return <PhaseSelection onSelectPhase={handleSelectPhase} />;
    }
  };

  return (
    <>
      <Header onHistoryClick={handleHistoryClick} />
      {renderView()}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
