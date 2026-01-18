import { useMemo } from 'react';
import { WorkoutLog } from '../types';
import {
  getAllUniqueExercises,
  getExerciseProgressionData,
  getWeeklyFrequency,
  getWorkoutCalendar
} from '../utils/statsHelpers';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface StatsViewProps {
  workoutLog: WorkoutLog;
  onBack: () => void;
}

export default function StatsView({ workoutLog, onBack }: StatsViewProps) {
  // Get all unique exercises
  const uniqueExercises = useMemo(
    () => getAllUniqueExercises(workoutLog),
    [workoutLog]
  );

  // Get exercise progression data for exercises with at least 2 data points in last 30 days
  const exerciseData = useMemo(() => {
    return uniqueExercises
      .map(exercise => getExerciseProgressionData(workoutLog, exercise, 30))
      .filter(data => data.data.length >= 2); // Only show exercises with at least 2 workouts
  }, [uniqueExercises, workoutLog]);

  // Get weekly frequency
  const weeklyData = useMemo(
    () => getWeeklyFrequency(workoutLog, 4),
    [workoutLog]
  );

  // Get calendar data
  const calendarData = useMemo(
    () => getWorkoutCalendar(workoutLog, 28),
    [workoutLog]
  );

  // Check if there's any data
  const hasCompletedWorkouts = Object.values(workoutLog).some(
    entry => entry.completed
  );

  // Format date for charts (MMM DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format week label (MMM DD)
  const formatWeekLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!hasCompletedWorkouts) {
    return (
      <section className="view">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Stats</h2>
        <div className="empty-stats">
          <div className="empty-state-icon">📊</div>
          <p>Complete some workouts to see stats</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <h2>Stats</h2>

      {/* Exercise Progression Section */}
      {exerciseData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">Exercise Progression (Last 30 Days)</h3>
          {exerciseData.map((data, idx) => (
            <div key={idx} className="exercise-chart">
              <h4 className="exercise-chart-title">{data.exerciseName}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2b47" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="#a8dadc"
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis
                    stroke="#a8dadc"
                    style={{ fontSize: '0.75rem' }}
                    label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', style: { fill: '#a8dadc' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#16213e',
                      border: '1px solid #1f2b47',
                      borderRadius: '8px',
                      color: '#f1faee'
                    }}
                    formatter={(value: number | undefined) => value ? [`${value.toFixed(1)} lbs`, 'Avg Weight'] : ['', '']}
                    labelFormatter={(label) => `Date: ${formatDate(label as string)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgWeight"
                    stroke="#457b9d"
                    strokeWidth={2}
                    dot={{ fill: '#457b9d', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Frequency Section */}
      {weeklyData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">Weekly Workout Frequency</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2b47" />
              <XAxis
                dataKey="weekStart"
                tickFormatter={formatWeekLabel}
                stroke="#a8dadc"
                style={{ fontSize: '0.7rem' }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#a8dadc"
                style={{ fontSize: '0.75rem' }}
                allowDecimals={false}
                label={{ value: 'Workouts', angle: -90, position: 'insideLeft', style: { fill: '#a8dadc' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#16213e',
                  border: '1px solid #1f2b47',
                  borderRadius: '8px',
                  color: '#f1faee'
                }}
                formatter={(value: number | undefined) => value ? [`${value} workout${value !== 1 ? 's' : ''}`, 'Count'] : ['', '']}
                labelFormatter={(label) => formatWeekLabel(label as string)}
              />
              <Bar dataKey="workoutCount" fill="#e63946" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Workout Calendar Section */}
      <div className="stats-section">
        <h3 className="stats-section-title">Workout Calendar (Last 4 Weeks)</h3>
        <div className="calendar-container">
          {/* Day headers */}
          <div className="calendar-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="calendar-body">
            {(() => {
              // Get the first day to display (start of first week)
              const firstDate = new Date(calendarData[0]?.date || new Date());
              const startDay = firstDate.getDay(); // 0-6 (Sunday-Saturday)

              // Create empty cells for days before our data starts
              const cells = [];
              for (let i = 0; i < startDay; i++) {
                cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
              }

              // Add calendar data cells
              calendarData.forEach((day, idx) => {
                const date = new Date(day.date);
                const dayOfMonth = date.getDate();
                const hasWorkout = day.workoutCount > 0;
                const title = `${formatDate(day.date)}${hasWorkout ? ': Workout completed' : ': Rest day'}`;

                cells.push(
                  <div
                    key={idx}
                    className={`calendar-cell ${hasWorkout ? 'has-workout' : ''}`}
                    title={title}
                  >
                    <span className="calendar-date">{dayOfMonth}</span>
                    {hasWorkout && <span className="workout-indicator">✓</span>}
                  </div>
                );
              });

              return cells;
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
