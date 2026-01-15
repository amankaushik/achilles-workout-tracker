import { useState, useEffect, useRef } from 'react';
import { WORKOUT_DATA } from '../data/workoutData';
import { toRoman } from '../utils/helpers';
import { WorkoutLogEntry, ExerciseLog, SetData } from '../types';

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
  const isInitialMount = useRef(true);

  const [exerciseData, setExerciseData] = useState<ExerciseFormData[]>(() => {
    return workout.exercises.map((exercise, idx) => {
      const existing = existingData?.exercises?.[idx];
      return {
        sets: Array.from({ length: exercise.sets }, (_, setIdx) => ({
          weight: existing?.sets?.[setIdx]?.weight || '',
          reps: existing?.sets?.[setIdx]?.reps || ''
        })),
        notes: existing?.notes || ''
      };
    });
  });

  // Auto-save when exerciseData changes (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      const exercises: ExerciseLog[] = workout.exercises.map((exercise, idx) => ({
        name: exercise.name,
        targetSets: exercise.sets,
        targetReps: exercise.reps,
        sets: exerciseData[idx].sets,
        notes: exerciseData[idx].notes
      }));

      onSave(exercises, false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [exerciseData, workout.exercises, onSave]);

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
    </section>
  );
}
