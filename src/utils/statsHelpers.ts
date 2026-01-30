import { WorkoutLog } from '../types';

export interface ExerciseProgressionData {
  exerciseName: string;
  data: {
    date: string;
    avgWeight: number;
    workoutCount: number;
  }[];
}

export interface WeeklyFrequency {
  weekStart: string;
  workoutCount: number;
}

export interface CalendarData {
  date: string;
  workoutCount: number;
}

/**
 * Parse weight string to number
 * Handles formats: "135 lbs", "135", "60 kg", etc.
 */
export function parseWeight(weightStr: string): number | null {
  if (!weightStr || weightStr.trim() === '') return null;

  // Remove "lbs", "kg", and other non-numeric characters except decimals
  const numStr = weightStr.replace(/[^\d.]/g, '');
  const num = parseFloat(numStr);

  return isNaN(num) ? null : num;
}

/**
 * Get all unique exercise names from completed workouts
 */
export function getAllUniqueExercises(workoutLog: WorkoutLog): string[] {
  const exerciseSet = new Set<string>();

  Object.values(workoutLog).forEach(entry => {
    if (entry.completed && entry.exercises) {
      entry.exercises.forEach(exercise => {
        exerciseSet.add(exercise.name);
      });
    }
  });

  return Array.from(exerciseSet).sort();
}

/**
 * Get exercise progression data for a specific exercise over the last N days
 */
export function getExerciseProgressionData(
  workoutLog: WorkoutLog,
  exerciseName: string,
  days: number = 30
): ExerciseProgressionData {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const dataMap = new Map<string, { weights: number[]; count: number }>();

  Object.values(workoutLog).forEach(entry => {
    if (!entry.completed || !entry.completedAt) return;

    const completedDate = new Date(entry.completedAt);
    if (completedDate < cutoffDate) return;

    // Find all instances of this exercise in the workout
    entry.exercises.forEach(exercise => {
      if (exercise.name === exerciseName) {
        const dateKey = completedDate.toISOString().split('T')[0];

        // Parse all set weights
        const weights = exercise.sets
          .map(set => parseWeight(set.weight))
          .filter(w => w !== null) as number[];

        if (weights.length > 0) {
          if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, { weights: [], count: 0 });
          }
          const existing = dataMap.get(dateKey)!;
          existing.weights.push(...weights);
          existing.count++;
        }
      }
    });
  });

  // Calculate average weight for each date
  const data = Array.from(dataMap.entries())
    .map(([date, { weights, count }]) => ({
      date,
      avgWeight: weights.reduce((sum, w) => sum + w, 0) / weights.length,
      workoutCount: count
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    exerciseName,
    data
  };
}

/**
 * Get weekly workout frequency for the last N weeks
 */
export function getWeeklyFrequency(
  workoutLog: WorkoutLog,
  weeks: number = 4
): WeeklyFrequency[] {
  const today = new Date();

  // Get Monday of current week
  const dayOfWeek = today.getDay();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  currentMonday.setHours(0, 0, 0, 0);

  // Initialize all weeks with 0
  const weeklyMap = new Map<string, number>();
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() - (i * 7));
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyMap.set(weekKey, 0);
  }

  // Count workouts for each week
  Object.values(workoutLog).forEach(entry => {
    if (!entry.completed || !entry.completedAt) return;

    const completedDate = new Date(entry.completedAt);

    // Get Monday of the week for this workout
    const workoutDayOfWeek = completedDate.getDay();
    const workoutMonday = new Date(completedDate);
    workoutMonday.setDate(completedDate.getDate() - (workoutDayOfWeek === 0 ? 6 : workoutDayOfWeek - 1));
    workoutMonday.setHours(0, 0, 0, 0);
    const weekKey = workoutMonday.toISOString().split('T')[0];

    // Only count if it's within our tracked weeks
    if (weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, weeklyMap.get(weekKey)! + 1);
    }
  });

  return Array.from(weeklyMap.entries())
    .map(([weekStart, workoutCount]) => ({ weekStart, workoutCount }))
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
}

/**
 * Get workout calendar data for the last N days
 */
export function getWorkoutCalendar(
  workoutLog: WorkoutLog,
  days: number = 28
): CalendarData[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const calendarMap = new Map<string, number>();

  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    calendarMap.set(dateKey, 0);
  }

  // Count workouts per day
  Object.values(workoutLog).forEach(entry => {
    if (!entry.completed || !entry.completedAt) return;

    const completedDate = new Date(entry.completedAt);
    if (completedDate < cutoffDate) return;

    const dateKey = completedDate.toISOString().split('T')[0];
    calendarMap.set(dateKey, (calendarMap.get(dateKey) || 0) + 1);
  });

  return Array.from(calendarMap.entries())
    .map(([date, workoutCount]) => ({ date, workoutCount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get total completed workouts count
 */
export function getTotalWorkouts(workoutLog: WorkoutLog): number {
  return Object.values(workoutLog).filter(entry => entry.completed).length;
}

/**
 * Get current workout streak (consecutive days with workouts)
 */
export function getCurrentStreak(workoutLog: WorkoutLog): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDates = Object.values(workoutLog)
    .filter(entry => entry.completed && entry.completedAt)
    .map(entry => {
      const date = new Date(entry.completedAt!);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a); // Sort descending (most recent first)

  if (workoutDates.length === 0) return 0;

  // Remove duplicates (same day multiple workouts)
  const uniqueDates = Array.from(new Set(workoutDates));

  let streak = 0;
  let checkDate = today.getTime();

  for (const workoutDate of uniqueDates) {
    // Check if this workout was on checkDate
    if (workoutDate === checkDate) {
      streak++;
      // Move to previous day
      checkDate -= 24 * 60 * 60 * 1000;
    } else if (workoutDate < checkDate) {
      // If there's a gap of more than 1 day, streak is broken
      const daysDiff = Math.floor((checkDate - workoutDate) / (24 * 60 * 60 * 1000));
      if (daysDiff > 1) break;

      streak++;
      checkDate = workoutDate - 24 * 60 * 60 * 1000;
    }
  }

  return streak;
}

/**
 * Get workout count for current week (Monday - Sunday)
 */
export function getThisWeekWorkouts(workoutLog: WorkoutLog): number {
  const today = new Date();

  // Get Monday of current week
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  return Object.values(workoutLog).filter(entry => {
    if (!entry.completed || !entry.completedAt) return false;
    const completedDate = new Date(entry.completedAt);
    return completedDate >= monday && completedDate <= today;
  }).length;
}

/**
 * Get best (max) weight for an exercise
 */
export function getBestWeight(workoutLog: WorkoutLog, exerciseName: string): number | null {
  let maxWeight: number | null = null;

  Object.values(workoutLog).forEach(entry => {
    if (!entry.completed) return;

    entry.exercises.forEach(exercise => {
      if (exercise.name === exerciseName) {
        exercise.sets.forEach(set => {
          const weight = parseWeight(set.weight);
          if (weight !== null && (maxWeight === null || weight > maxWeight)) {
            maxWeight = weight;
          }
        });
      }
    });
  });

  return maxWeight;
}

/**
 * Get latest weight for an exercise (from most recent workout)
 */
export function getLatestWeight(workoutLog: WorkoutLog, exerciseName: string): number | null {
  const completedWorkouts = Object.values(workoutLog)
    .filter(entry => entry.completed && entry.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  for (const workout of completedWorkouts) {
    for (const exercise of workout.exercises) {
      if (exercise.name === exerciseName) {
        const weights = exercise.sets
          .map(set => parseWeight(set.weight))
          .filter(w => w !== null) as number[];

        if (weights.length > 0) {
          return weights.reduce((sum, w) => sum + w, 0) / weights.length;
        }
      }
    }
  }

  return null;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get most improved exercise (highest % gain from first to latest workout)
 */
export function getMostImprovedExercise(workoutLog: WorkoutLog): { name: string; percentChange: number } | null {
  const exercises = getAllUniqueExercises(workoutLog);
  let bestImprovement: { name: string; percentChange: number } | null = null;

  exercises.forEach(exerciseName => {
    const data = getExerciseProgressionData(workoutLog, exerciseName, 90);

    if (data.data.length >= 2) {
      const firstWeight = data.data[0].avgWeight;
      const lastWeight = data.data[data.data.length - 1].avgWeight;
      const percentChange = calculatePercentChange(firstWeight, lastWeight);

      if (bestImprovement === null || percentChange > bestImprovement.percentChange) {
        bestImprovement = { name: exerciseName, percentChange };
      }
    }
  });

  return bestImprovement;
}
