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

      <div className="phases-grid">
        {Object.entries(structure).map(([phaseNum, phase]) => (
          <div key={phaseNum} className="phase-preview-card">
            <div className="phase-preview-header">
              <h3 className="phase-preview-title">Phase {phaseNum}</h3>
              <p className="phase-preview-name">{phase.name}</p>
            </div>

            <div className="workouts-preview-list">
              {Object.entries(phase.workouts).map(([workoutNum, workout]) => (
                <div key={workoutNum} className="workout-preview-item">
                  <div className="workout-preview-title-bar">
                    <span className="workout-preview-num">Workout {workoutNum}</span>
                    <span className="workout-preview-focus">{workout.focus}</span>
                  </div>

                  <div className="exercises-list">
                    {workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="exercise-preview-item">
                        <span className="exercise-preview-name">{exercise.name}</span>
                        <span className="exercise-preview-sets">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
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
