import { useState, useEffect } from 'react';

const STORAGE_KEY = 'achilles_workout_log';

export function useWorkoutStorage() {
  const [workoutLog, setWorkoutLog] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutLog));
  }, [workoutLog]);

  const saveWorkout = (key, data) => {
    setWorkoutLog(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const deleteWorkout = (key) => {
    setWorkoutLog(prev => {
      const newLog = { ...prev };
      delete newLog[key];
      return newLog;
    });
  };

  const getWorkout = (key) => workoutLog[key];

  const hasWeekData = (phase, week) => {
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
