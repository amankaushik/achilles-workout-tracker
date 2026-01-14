import { useState, useEffect } from 'react';
import { WorkoutLog, WorkoutLogEntry } from '../types';

const STORAGE_KEY = 'achilles_workout_log';

export function useWorkoutStorage() {
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutLog));
  }, [workoutLog]);

  const saveWorkout = (key: string, data: WorkoutLogEntry) => {
    setWorkoutLog(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const deleteWorkout = (key: string) => {
    setWorkoutLog(prev => {
      const newLog = { ...prev };
      delete newLog[key];
      return newLog;
    });
  };

  const getWorkout = (key: string): WorkoutLogEntry | undefined => workoutLog[key];

  const hasWeekData = (phase: number, week: number): boolean => {
    for (let workout = 1; workout <= 5; workout++) {
      if (workoutLog[`${phase}-${week}-${workout}`]) return true;
    }
    return false;
  };

  return {
    workoutLog,
    saveWorkout,
    deleteWorkout,
    getWorkout,
    hasWeekData
  };
}
