import { WORKOUT_DATA } from '../data/workoutData';
import { toRoman } from '../utils/helpers';

interface WorkoutPreviewProps {
  phase: number;
  week: number;
  workoutNum: number;
  onStartWorkout: () => void;
  onBack: () => void;
}

export default function WorkoutPreview({
  phase,
  week,
  workoutNum,
  onStartWorkout,
  onBack
}: WorkoutPreviewProps) {
  const workout = WORKOUT_DATA[phase].workouts[workoutNum];

  return (
    <section className="view">
      <button className="back-btn" onClick={onBack}>
        ← Back to Workouts
      </button>

      <div className="workout-header">
        <h2>{workout.name}: {workout.focus}</h2>
        <span className="workout-date">Phase {toRoman(phase)} - Week {week}</span>
      </div>

      <div className="workout-preview-info">
        <p className="preview-description">
          Review the exercises below, then start your workout when ready.
        </p>
      </div>

      <div className="exercise-list">
        {workout.exercises.map((exercise, idx) => (
          <div key={idx} className="exercise-card preview">
            <div className="exercise-header">
              <span className="exercise-name">{exercise.name}</span>
              <span className="exercise-scheme">{exercise.sets}x{exercise.reps}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="save-btn primary full-width" onClick={onStartWorkout}>
        Start Workout
      </button>
    </section>
  );
}
