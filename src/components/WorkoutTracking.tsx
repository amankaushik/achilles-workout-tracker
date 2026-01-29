import { useState } from 'react';
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

  const handleSetChange = (exerciseIdx: number, setIdx: number, field: keyof SetData, value: string) => {
    setExerciseData(prev => {
      const newData = [...prev];
      newData[exerciseIdx] = {
        ...newData[exerciseIdx],
        sets: newData[exerciseIdx].sets.map((set, idx) =>
          idx === setIdx ? { ...set, [field]: value } : set
        )
      };
      return newData;
    });
  };

  const handleNotesChange = (exerciseIdx: number, value: string) => {
    setExerciseData(prev => {
      const newData = [...prev];
      newData[exerciseIdx] = {
        ...newData[exerciseIdx],
        notes: value
      };
      return newData;
    });
  };

  const handleSetComplete = (exerciseIdx: number, setIdx: number, isChecked: boolean) => {
    let shouldSave = false;

    setExerciseData(prev => {
      const newData = [...prev];
      const currentSet = newData[exerciseIdx].sets[setIdx];

      // If unchecking, just update the completed status
      if (!isChecked) {
        newData[exerciseIdx] = {
          ...newData[exerciseIdx],
          sets: newData[exerciseIdx].sets.map((set, idx) =>
            idx === setIdx ? { ...set, completed: false } : set
          )
        };
        shouldSave = true;
      } else {
        // If checking the first set (setIdx === 0), pre-fill remaining sets
        if (setIdx === 0 && currentSet.weight && currentSet.reps) {
          newData[exerciseIdx] = {
            ...newData[exerciseIdx],
            sets: newData[exerciseIdx].sets.map((set, idx) => {
              if (idx === 0) {
                return { ...set, completed: true };
              } else if (!set.completed) {
                // Pre-fill only if not already completed
                return {
                  weight: currentSet.weight,
                  reps: currentSet.reps,
                  completed: false
                };
              }
              return set;
            })
          };
        } else {
          // Just mark the set as complete
          newData[exerciseIdx] = {
            ...newData[exerciseIdx],
            sets: newData[exerciseIdx].sets.map((set, idx) =>
              idx === setIdx ? { ...set, completed: true } : set
            )
          };
        }
        shouldSave = true;
      }

      // Save after state is updated
      if (shouldSave) {
        setTimeout(() => {
          const exercises: ExerciseLog[] = workout.exercises.map((exercise, idx) => ({
            name: exercise.name,
            targetSets: exercise.sets,
            targetReps: exercise.reps,
            sets: newData[idx].sets,
            notes: newData[idx].notes
          }));
          onSave(exercises, false);
        }, 0);
      }

      return newData;
    });
  };

  const handleMarkComplete = () => {
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
      <button className="back-btn" onClick={onBack}>
        ← Back to Workouts
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
                <span>✓</span>
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
                  />
                  <input
                    type="text"
                    className="set-input"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => handleSetChange(exerciseIdx, setIdx, 'reps', e.target.value)}
                    inputMode="numeric"
                  />
                  <input
                    type="checkbox"
                    className="set-checkbox"
                    checked={set.completed || false}
                    onChange={(e) => handleSetComplete(exerciseIdx, setIdx, e.target.checked)}
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
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="save-btn primary full-width" onClick={handleMarkComplete}>
        Mark Complete
      </button>

      {/* Floating Action Button */}
      <button
        className="fab-stopwatch"
        onClick={() => setIsStopwatchOpen(!isStopwatchOpen)}
        aria-label="Toggle stopwatch"
      >
        ⏱️
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
              ✕
            </button>
          </div>
          <Stopwatch />
        </div>
      </div>
    </section>
  );
}
