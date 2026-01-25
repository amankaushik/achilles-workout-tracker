import { WorkoutDataType } from '../types';

interface ProgramPreviewProps {
  programName: string;
  programDescription: string | null;
  structure: WorkoutDataType;
}

export default function ProgramPreview({ programName, programDescription, structure }: ProgramPreviewProps) {
  return (
    <div className="program-preview">
      <div className="program-preview-header">
        <h2>{programName}</h2>
        {programDescription && <p className="program-preview-description">{programDescription}</p>}
      </div>

      <div className="phases-overview">
        {Object.entries(structure).map(([phaseNum, phase]) => (
          <div key={phaseNum} className="phase-card">
            <h3 className="phase-title">Phase {phaseNum}: {phase.name}</h3>

            <div className="workouts-list">
              {Object.entries(phase.workouts).map(([workoutNum, workout]) => (
                <div key={workoutNum} className="workout-item">
                  <div className="workout-header">
                    <span className="workout-number">Workout {workoutNum}</span>
                    <span className="workout-focus">{workout.focus}</span>
                  </div>

                  <div className="exercises-summary">
                    <span className="exercises-count">
                      {workout.exercises.length} exercises
                    </span>
                    <div className="exercise-names">
                      {workout.exercises.slice(0, 3).map((ex, idx) => (
                        <span key={idx} className="exercise-name">
                          {ex.name}
                        </span>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="more-exercises">
                          +{workout.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
