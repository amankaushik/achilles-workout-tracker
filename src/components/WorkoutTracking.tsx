import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Timer, X } from 'lucide-react';
import { WORKOUT_DATA } from '../data/workoutData';
import { toRoman } from '../utils/helpers';
import { WorkoutLogEntry, ExerciseLog, SetData } from '../types';
import Stopwatch from './Stopwatch';

interface ExerciseFormData {
  sets: SetData[];
  notes: string;
}

interface WorkoutTrackingProps {
  phase: number;
  week: number;
  workoutNum: number;
  existingData: WorkoutLogEntry | undefined;
  onSave: (exercises: ExerciseLog[], markComplete: boolean) => void;
  onBack: () => void;
}

export default function WorkoutTracking({
  phase,
  week,
  workoutNum,
  existingData,
  onSave,
  onBack
}: WorkoutTrackingProps) {
  const workout = WORKOUT_DATA[phase].workouts[workoutNum];
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const isDirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [exerciseData, setExerciseData] = useState<ExerciseFormData[]>(() => {
    return workout.exercises.map((exercise, idx) => {
      const existing = existingData?.exercises?.[idx];
      return {
        sets: Array.from({ length: exercise.sets }, (_, setIdx) => ({
          weight: existing?.sets?.[setIdx]?.weight || '',
          reps: existing?.sets?.[setIdx]?.reps || '',
          completed: existing?.sets?.[setIdx]?.completed || false
        })),
        notes: existing?.notes || ''
      };
    });
  });

  const buildExercises = useCallback((): ExerciseLog[] => {
    return workout.exercises.map((exercise, idx) => ({
      name: exercise.name,
      targetSets: exercise.sets,
      targetReps: exercise.reps,
      sets: exerciseData[idx].sets,
      notes: exerciseData[idx].notes
    }));
  }, [workout.exercises, exerciseData]);

  // Keep refs in sync for use in timers and cleanup
  const buildExercisesRef = useRef(buildExercises);
  const onSaveRef = useRef(onSave);
  const existingDataRef = useRef(existingData);
  useEffect(() => {
    buildExercisesRef.current = buildExercises;
    onSaveRef.current = onSave;
    existingDataRef.current = existingData;
  });

  // Save unsaved changes on unmount (e.g. navigating away)
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
      if (isDirtyRef.current && !existingDataRef.current?.completed) {
        onSaveRef.current(buildExercisesRef.current(), false);
      }
    };
  }, []);

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Pre-fill: for each exercise, if a set has both weight and reps
      // and the next set is empty, copy values to the next set
      setExerciseData(prev => {
        let anyChanged = false;
        const newData = prev.map(exercise => {
          const newSets = [...exercise.sets];
          let changed = false;
          for (let i = 0; i < newSets.length - 1; i++) {
            const current = newSets[i];
            const next = newSets[i + 1];
            if (current.weight && current.reps && !next.weight && !next.reps) {
              newSets[i + 1] = { weight: current.weight, reps: current.reps, completed: false };
              changed = true;
              anyChanged = true;
              break; // Only fill one set at a time per exercise
            }
          }
          return changed ? { ...exercise, sets: newSets } : exercise;
        });
        return anyChanged ? newData : prev;
      });

      // Save after React processes any pre-fill state update
      setTimeout(() => {
        isDirtyRef.current = false;
        onSaveRef.current(buildExercisesRef.current(), false);
      }, 0);
    }, 500);
  }, []);

  const handleSetChange = (exerciseIdx: number, setIdx: number, field: keyof SetData, value: string) => {
    isDirtyRef.current = true;
    setExerciseData(prev => {
      const newData = [...prev];
      const prevSet = newData[exerciseIdx].sets[setIdx];
      const updatedSet = { ...prevSet, [field]: value };

      // Derive completed from having both weight and reps
      updatedSet.completed = !!(updatedSet.weight && updatedSet.reps);

      const sets = newData[exerciseIdx].sets.map((set, idx) =>
        idx === setIdx ? updatedSet : set
      );

      newData[exerciseIdx] = { ...newData[exerciseIdx], sets };
      return newData;
    });

    scheduleSave();
  };

  const handleNotesChange = (exerciseIdx: number, value: string) => {
    isDirtyRef.current = true;
    setExerciseData(prev => {
      const newData = [...prev];
      newData[exerciseIdx] = {
        ...newData[exerciseIdx],
        notes: value
      };
      return newData;
    });

    scheduleSave();
  };

  const handleMarkComplete = () => {
    isDirtyRef.current = false;
    clearTimeout(saveTimerRef.current);
    const exercises: ExerciseLog[] = workout.exercises.map((exercise, idx) => ({
      name: exercise.name,
      targetSets: exercise.sets,
      targetReps: exercise.reps,
      sets: exerciseData[idx].sets,
      notes: exerciseData[idx].notes
    }));

    onSave(exercises, true);
  };

  return (
    <section className="view">
      <button className="btn btn-ghost btn-sm back-btn" onClick={onBack}>
        <ChevronLeft size={20} /> Back to Workouts
      </button>

      <div className="workout-header">
        <h2>{workout.name}: {workout.focus}</h2>
        <span className="workout-date">Phase {toRoman(phase)} - Week {week}</span>
      </div>

      <div className="exercise-list">
        {workout.exercises.map((exercise, exerciseIdx) => (
          <div key={exerciseIdx} className="exercise-card">
            <div className="exercise-header">
              <span className="exercise-name">{exercise.name}</span>
              <span className="exercise-scheme">{exercise.sets}x{exercise.reps}</span>
            </div>
            <div className="exercise-body">
              <div className="input-labels">
                <span></span>
                <span>Weight</span>
                <span>Reps</span>
              </div>

              {exerciseData[exerciseIdx].sets.map((set, setIdx) => (
                <div key={setIdx} className="set-row">
                  <span className="set-label">Set {setIdx + 1}</span>
                  <input
                    type="text"
                    className="set-input"
                    placeholder="Weight"
                    value={set.weight}
                    onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'weight', e.target.value)}
                    inputMode="decimal"
                    disabled={existingData?.completed}
                  />
                  <input
                    type="text"
                    className="set-input"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'reps', e.target.value)}
                    inputMode="numeric"
                    disabled={existingData?.completed}
                  />
                </div>
              ))}

              <div className="notes-container">
                <label className="notes-label">Notes</label>
                <textarea
                  className="notes-input"
                  placeholder="Add notes..."
                  value={exerciseData[exerciseIdx].notes}
                  onChange={(e) => handleNotesChange(exerciseIdx, e.target.value)}
                  disabled={existingData?.completed}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!existingData?.completed && (
        <button className="btn btn-primary btn-lg btn-full" onClick={handleMarkComplete}>
          Mark Complete
        </button>
      )}

      {existingData?.completed && (
        <div className="workout-completed-message" style={{
          textAlign: 'center',
          padding: '16px',
          marginTop: '8px',
          background: 'var(--surface)',
          borderRadius: 'var(--border-radius)',
          color: 'var(--success)',
          fontWeight: 600
        }}>
          Workout Completed
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fab-stopwatch"
        onClick={() => setIsStopwatchOpen(!isStopwatchOpen)}
        aria-label="Toggle stopwatch"
      >
        <Timer size={28} strokeWidth={2.5} />
      </button>

      {/* Stopwatch Modal */}
      <div className={`stopwatch-modal-overlay ${!isStopwatchOpen ? 'hidden' : ''}`}>
        <div className="stopwatch-modal">
          <div className="stopwatch-modal-header">
            <h3>Stopwatch</h3>
            <button
              className="stopwatch-modal-close"
              onClick={() => setIsStopwatchOpen(false)}
              aria-label="Close stopwatch"
            >
              <X size={24} />
            </button>
          </div>
          <Stopwatch />
        </div>
      </div>
    </section>
  );
}
