import { toRoman, formatDate } from '../utils/helpers';
import { WorkoutLogEntry } from '../types';

interface HistoryDetailProps {
  data: WorkoutLogEntry;
  onDelete: () => void;
  onBack: () => void;
}

export default function HistoryDetail({ data, onDelete, onBack }: HistoryDetailProps) {
  return (
    <section className="view">
      <button className="back-btn" onClick={onBack}>
        ← Back to History
      </button>
      <h2>{data.workoutName}: {data.focus}</h2>

      <div className="history-detail-content">
        <div className="history-card-meta" style={{ marginBottom: '16px' }}>
          Phase {toRoman(data.phase)} - Week {data.week}
          <br />
          <small>
            {data.completed && data.completedAt
              ? `Completed: ${formatDate(data.completedAt)}`
              : `Last saved: ${formatDate(data.savedAt)} (In Progress)`
            }
          </small>
        </div>

        {data.exercises.map((exercise, idx) => {
          const hasSets = exercise.sets.some(s => s.weight || s.reps);

          return (
            <div key={idx} className="history-exercise">
              <div className="history-exercise-name">
                {exercise.name} <small>({exercise.targetSets}x{exercise.targetReps})</small>
              </div>
              <div className="history-sets">
                {hasSets ? (
                  exercise.sets.map((set, setIdx) => (
                    (set.weight || set.reps) ? (
                      <div key={setIdx} className="history-set">
                        <span className="history-set-label">Set {setIdx + 1}:</span>
                        <span className="history-set-value">
                          {set.weight || '-'} x {set.reps || '-'}
                        </span>
                      </div>
                    ) : null
                  ))
                ) : (
                  <div className="history-set">
                    <span className="history-set-value">No data recorded</span>
                  </div>
                )}
              </div>
              {exercise.notes && (
                <div className="history-notes">{exercise.notes}</div>
              )}
            </div>
          );
        })}

        <button className="delete-btn" onClick={onDelete}>
          Delete This Entry
        </button>
      </div>
    </section>
  );
}
