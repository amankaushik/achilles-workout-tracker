import { toRoman, formatDate } from '../utils/helpers';
import { WorkoutLog, WorkoutLogEntry } from '../types';

interface HistoryViewProps {
  workoutLog: WorkoutLog;
  onSelectEntry: (key: string) => void;
  onBack: () => void;
}

export default function HistoryView({ workoutLog, onSelectEntry, onBack }: HistoryViewProps) {
  const entries = Object.entries(workoutLog)
    .sort((a, b) => new Date(b[1].savedAt).getTime() - new Date(a[1].savedAt).getTime()) as [string, WorkoutLogEntry][];

  return (
    <section className="view">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <h2>Workout History</h2>

      <div className="history-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No workouts logged yet</p>
          </div>
        ) : (
          entries.map(([key, data]) => {
            const displayDate = data.completed && data.completedAt
              ? data.completedAt
              : data.savedAt;

            return (
              <div
                key={key}
                className="history-card"
                onClick={() => onSelectEntry(key)}
              >
                <div className="history-card-header">
                  <span className="history-card-title">
                    {data.workoutName}: {data.focus}
                  </span>
                  <span className="history-card-date">{formatDate(displayDate)}</span>
                </div>
                <div className="history-card-meta">
                  Phase {toRoman(data.phase)} - Week {data.week}
                  <span className={`history-status ${data.completed ? 'completed' : 'in-progress'}`}>
                    {data.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
