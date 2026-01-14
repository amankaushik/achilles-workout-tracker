import { WORKOUT_DATA } from '../data/workoutData';

export default function WorkoutSelection({ phase, week, workoutLog, onSelectWorkout, onBack }) {
  const phaseData = WORKOUT_DATA[phase];

  const getWorkoutStatus = (workoutNum) => {
    const key = `${phase}-${week}-${workoutNum}`;
    const logEntry = workoutLog[key];

    if (!logEntry) {
      return { className: '', text: 'Not started' };
    }
    if (logEntry.completed) {
      return { className: 'completed', text: 'Done' };
    }
    return { className: 'in-progress', text: 'In Progress' };
  };

  return (
    <section className="view">
      <button className="back-btn" onClick={onBack}>
        ← Back to Weeks
      </button>
      <h2>Week {week} - Select Workout</h2>
      <div className="workout-list">
        {[1, 2, 3, 4, 5].map((workoutNum) => {
          const workout = phaseData.workouts[workoutNum];
          const status = getWorkoutStatus(workoutNum);

          return (
            <div
              key={workoutNum}
              className="workout-card"
              onClick={() => onSelectWorkout(workoutNum)}
            >
              <div className="workout-info">
                <span className="workout-num">{workout.name}</span>
                <span className="workout-focus">{workout.focus}</span>
              </div>
              <span className={`workout-status ${status.className}`}>
                {status.text}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
