import { useMemo, useState } from 'react';
import { BarChart3, ChevronLeft, Dumbbell, Flame, Target, TrendingUp, Calendar as CalendarIcon, Award, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { WorkoutLog } from '../types';
import {
  getAllUniqueExercises,
  getExerciseProgressionData,
  getWeeklyFrequency,
  getWorkoutCalendar,
  getTotalWorkouts,
  getCurrentStreak,
  getThisWeekWorkouts,
  getMostImprovedExercise,
  getBestWeight,
  getLatestWeight,
  calculatePercentChange
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
  // State for expanded exercise cards
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  // Get all unique exercises
  const uniqueExercises = useMemo(
    () => getAllUniqueExercises(workoutLog),
    [workoutLog]
  );

  const toggleExercise = (exerciseName: string) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseName)) {
        newSet.delete(exerciseName);
      } else {
        newSet.add(exerciseName);
      }
      return newSet;
    });
  };

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

  // Summary stats
  const totalWorkouts = useMemo(() => getTotalWorkouts(workoutLog), [workoutLog]);
  const currentStreak = useMemo(() => getCurrentStreak(workoutLog), [workoutLog]);
  const thisWeekWorkouts = useMemo(() => getThisWeekWorkouts(workoutLog), [workoutLog]);
  const mostImproved = useMemo(() => getMostImprovedExercise(workoutLog), [workoutLog]);

  // Calendar stats
  const calendarStats = useMemo(() => {
    const activeDays = calendarData.filter(day => day.workoutCount > 0).length;
    const restDays = calendarData.length - activeDays;
    const totalWorkoutsInPeriod = calendarData.reduce((sum, day) => sum + day.workoutCount, 0);

    return {
      activeDays,
      restDays,
      totalWorkouts: totalWorkoutsInPeriod
    };
  }, [calendarData]);

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
        <button className="btn btn-ghost btn-sm back-btn" onClick={onBack}>
          <ChevronLeft size={20} /> Back
        </button>
        <h2>Stats</h2>
        <div className="empty-stats">
          <BarChart3 className="empty-icon" size={64} strokeWidth={1.5} />
          <h3>Track Your Progress</h3>
          <p>Complete your first workout to unlock detailed statistics and insights</p>

          <div className="empty-stats-preview">
            <div className="empty-preview-item">
              <Dumbbell size={20} style={{ color: 'var(--primary)' }} />
              <span>Exercise Progress</span>
            </div>
            <div className="empty-preview-item">
              <Flame size={20} style={{ color: '#e9c46a' }} />
              <span>Workout Streaks</span>
            </div>
            <div className="empty-preview-item">
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
              <span>Personal Records</span>
            </div>
            <div className="empty-preview-item">
              <CalendarIcon size={20} style={{ color: 'var(--secondary)' }} />
              <span>Activity Calendar</span>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={onBack} style={{ marginTop: '24px' }}>
            Start Your First Workout
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="view">
      <button className="btn btn-ghost btn-sm back-btn" onClick={onBack}>
        <ChevronLeft size={20} /> Back
      </button>
      <h2>Stats</h2>

      {/* Summary Stats Cards */}
      <div className="stats-summary-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Dumbbell size={24} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{totalWorkouts}</div>
            <div className="stat-card-label">Total Workouts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-success)' }}>
            <Flame size={24} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{currentStreak}</div>
            <div className="stat-card-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-secondary)' }}>
            <Target size={24} strokeWidth={2} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{thisWeekWorkouts}</div>
            <div className="stat-card-label">This Week</div>
          </div>
        </div>

        {mostImproved && (
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #e9c46a 0%, #d4a24e 100%)' }}>
              <Award size={24} strokeWidth={2} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">+{mostImproved.percentChange.toFixed(0)}%</div>
              <div className="stat-card-label stat-card-label-wrap" title={mostImproved.name}>
                {mostImproved.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Progression Section */}
      {exerciseData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">
            <TrendingUp size={20} strokeWidth={2} style={{ marginRight: '8px' }} />
            Exercise Progression
          </h3>
          <div className="exercise-progress-grid">
            {exerciseData.map((data, idx) => {
              const bestWeight = getBestWeight(workoutLog, data.exerciseName);
              const latestWeight = getLatestWeight(workoutLog, data.exerciseName);
              const firstWeight = data.data.length > 0 ? data.data[0].avgWeight : null;
              const percentChange = firstWeight && latestWeight ? calculatePercentChange(firstWeight, latestWeight) : 0;
              const isExpanded = expandedExercises.has(data.exerciseName);

              let trendIcon = <Minus size={16} />;
              let trendColor = 'var(--text-muted)';
              if (percentChange > 0) {
                trendIcon = <ArrowUp size={16} />;
                trendColor = 'var(--success)';
              } else if (percentChange < 0) {
                trendIcon = <ArrowDown size={16} />;
                trendColor = '#e63946';
              }

              return (
                <div key={idx} className="exercise-progress-card">
                  <div className="exercise-progress-header">
                    <div className="exercise-progress-name">
                      <Dumbbell size={16} style={{ marginRight: '6px', opacity: 0.7 }} />
                      {data.exerciseName}
                    </div>
                  </div>

                  <div className="exercise-progress-stats">
                    <div className="exercise-stat">
                      <div className="exercise-stat-label">Best</div>
                      <div className="exercise-stat-value">{bestWeight?.toFixed(0) || '-'} lbs</div>
                    </div>

                    <div className="exercise-stat">
                      <div className="exercise-stat-label">Latest</div>
                      <div className="exercise-stat-value">
                        {latestWeight?.toFixed(0) || '-'} lbs
                        <span className="exercise-trend" style={{ color: trendColor }}>
                          {trendIcon}
                        </span>
                      </div>
                    </div>

                    <div className="exercise-stat">
                      <div className="exercise-stat-label">Change</div>
                      <div className="exercise-stat-value" style={{ color: trendColor }}>
                        {percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="exercise-sparkline">
                    <ResponsiveContainer width="100%" height={50}>
                      <LineChart data={data.data}>
                        <Line
                          type="monotone"
                          dataKey="avgWeight"
                          stroke={percentChange >= 0 ? '#2a9d8f' : '#e63946'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Toggle Details Button */}
                  <button
                    className="exercise-toggle-btn"
                    onClick={() => toggleExercise(data.exerciseName)}
                  >
                    {isExpanded ? (
                      <>
                        Hide Details <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown size={16} />
                      </>
                    )}
                  </button>

                  {/* Expanded Full Chart */}
                  {isExpanded && (
                    <div className="exercise-full-chart">
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Frequency Section */}
      {weeklyData.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section-title">
            <BarChart3 size={20} strokeWidth={2} style={{ marginRight: '8px' }} />
            Weekly Workout Frequency
          </h3>

          <div className="weekly-frequency-container">
            {/* Weekly Summary Cards */}
            <div className="weekly-summary-cards">
              <div className="weekly-summary-card">
                <div className="weekly-summary-label">Weekly Average</div>
                <div className="weekly-summary-value">
                  {(weeklyData.reduce((sum, week) => sum + week.workoutCount, 0) / weeklyData.length).toFixed(1)}
                </div>
              </div>

              <div className="weekly-summary-card">
                <div className="weekly-summary-label">This Week</div>
                <div className="weekly-summary-value" style={{ color: 'var(--success)' }}>
                  {weeklyData[weeklyData.length - 1]?.workoutCount || 0}
                </div>
              </div>

              <div className="weekly-summary-card">
                <div className="weekly-summary-label">Best Week</div>
                <div className="weekly-summary-value" style={{ color: 'var(--primary)' }}>
                  {Math.max(...weeklyData.map(w => w.workoutCount))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="weekly-chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2b47" />
                  <XAxis
                    dataKey="weekStart"
                    tickFormatter={formatWeekLabel}
                    stroke="#a8dadc"
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis
                    stroke="#a8dadc"
                    style={{ fontSize: '0.75rem' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#16213e',
                      border: '1px solid #1f2b47',
                      borderRadius: '8px',
                      color: '#f1faee'
                    }}
                    formatter={(value: number | undefined) => value ? [`${value} workout${value !== 1 ? 's' : ''}`, 'Count'] : ['', '']}
                    labelFormatter={(label) => `Week of ${formatWeekLabel(label as string)}`}
                  />
                  <Bar
                    dataKey="workoutCount"
                    fill="#e63946"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Workout Calendar Section */}
      <div className="stats-section">
        <h3 className="stats-section-title">
          <CalendarIcon size={20} strokeWidth={2} style={{ marginRight: '8px' }} />
          Workout Calendar (Last 4 Weeks)
        </h3>

        {/* Calendar Summary Cards */}
        <div className="calendar-summary-cards">
          <div className="calendar-summary-card">
            <div className="calendar-summary-icon" style={{ background: 'var(--gradient-success)' }}>
              <Dumbbell size={16} />
            </div>
            <div className="calendar-summary-content">
              <div className="calendar-summary-value">{calendarStats.activeDays}</div>
              <div className="calendar-summary-label">Active Days</div>
            </div>
          </div>

          <div className="calendar-summary-card">
            <div className="calendar-summary-icon" style={{ background: 'var(--gradient-secondary)' }}>
              <CalendarIcon size={16} />
            </div>
            <div className="calendar-summary-content">
              <div className="calendar-summary-value">{calendarStats.restDays}</div>
              <div className="calendar-summary-label">Rest Days</div>
            </div>
          </div>

          <div className="calendar-summary-card">
            <div className="calendar-summary-icon" style={{ background: 'var(--gradient-primary)' }}>
              <Target size={16} />
            </div>
            <div className="calendar-summary-content">
              <div className="calendar-summary-value">{calendarStats.totalWorkouts}</div>
              <div className="calendar-summary-label">Total Workouts</div>
            </div>
          </div>
        </div>

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
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              calendarData.forEach((day, idx) => {
                const date = new Date(day.date);
                date.setHours(0, 0, 0, 0);
                const dayOfMonth = date.getDate();
                const workoutCount = day.workoutCount;
                const isToday = date.getTime() === today.getTime();

                let intensityClass = '';
                if (workoutCount === 0) {
                  intensityClass = 'intensity-0';
                } else if (workoutCount === 1) {
                  intensityClass = 'intensity-1';
                } else if (workoutCount === 2) {
                  intensityClass = 'intensity-2';
                } else {
                  intensityClass = 'intensity-3';
                }

                const title = workoutCount > 0
                  ? `${formatDate(day.date)}: ${workoutCount} workout${workoutCount > 1 ? 's' : ''}`
                  : `${formatDate(day.date)}: Rest day`;

                cells.push(
                  <div
                    key={idx}
                    className={`calendar-cell ${intensityClass} ${isToday ? 'today' : ''}`}
                    title={title}
                  >
                    <span className="calendar-date">{dayOfMonth}</span>
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
