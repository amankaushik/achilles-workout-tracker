import { useState, useEffect, useRef } from 'react';
import { WorkoutLog, WorkoutLogEntry } from '../types';
import * as api from '../services/api';
import { CreateWorkoutLogRequest } from '../types/database';

const STORAGE_KEY = 'achilles_workout_log';

/**
 * Convert WorkoutLogEntry to CreateWorkoutLogRequest for API
 */
function toApiFormat(data: WorkoutLogEntry): CreateWorkoutLogRequest {
  return {
    phase: data.phase,
    week: data.week,
    workoutNum: data.workoutNum,
    workoutName: data.workoutName,
    focus: data.focus,
    completed: data.completed,
    completedAt: data.completedAt,
    exercises: data.exercises.map((exercise, index) => ({
      exerciseName: exercise.name,
      exerciseOrder: index + 1,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      notes: exercise.notes,
      sets: exercise.sets.map((set, setIndex) => ({
        setNumber: setIndex + 1,
        weight: set.weight,
        reps: set.reps,
      })),
    })),
  };
}

export function useWorkoutStorage() {
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const pendingSaveRef = useRef<{ key: string; data: WorkoutLogEntry } | null>(null);

  // Sync localStorage changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutLog));
  }, [workoutLog]);

  // Initial load from API
  useEffect(() => {
    async function loadFromApi() {
      try {
        const logs = await api.getWorkoutLogs();

        // Convert API logs to WorkoutLog format
        const apiLogs: WorkoutLog = {};
        for (const log of logs) {
          const key = `${log.phase}-${log.week}-${log.workoutNum}`;

          // Fetch full workout details
          const fullLog = await api.getWorkoutLog(log.phase, log.week, log.workoutNum);
          if (fullLog) {
            apiLogs[key] = {
              phase: fullLog.phase,
              week: fullLog.week,
              workoutNum: fullLog.workoutNum,
              workoutName: fullLog.workoutName,
              focus: fullLog.focus,
              exercises: fullLog.exercises.map(exercise => ({
                name: exercise.exerciseName,
                targetSets: exercise.targetSets,
                targetReps: exercise.targetReps,
                sets: exercise.sets.map(set => ({
                  weight: set.weight || '',
                  reps: set.reps || '',
                })),
                notes: exercise.notes || '',
              })),
              savedAt: fullLog.updatedAt,
              completed: fullLog.completed,
              completedAt: fullLog.completedAt,
            };
          }
        }

        // Replace state with API data only (API is source of truth)
        // This prevents old localStorage data from being re-uploaded
        setWorkoutLog(apiLogs);
      } catch (error) {
        console.error('Error loading from API:', error);
        setSyncError('Failed to sync with server');
      } finally {
        setIsLoading(false);
      }
    }

    loadFromApi();
  }, []);

  const saveWorkout = async (key: string, data: WorkoutLogEntry) => {
    // Update localStorage immediately
    setWorkoutLog(prev => ({
      ...prev,
      [key]: data
    }));

    // If already saving, queue this save
    if (isSaving) {
      pendingSaveRef.current = { key, data };
      return;
    }

    // Save to API
    setIsSaving(true);
    try {
      const apiData = toApiFormat(data);
      await api.saveWorkoutLog(apiData);
      setSyncError(null);
    } catch (error) {
      console.error('Error saving to API:', error);
      setSyncError('Failed to sync with server');
    } finally {
      setIsSaving(false);

      // Process pending save if any
      if (pendingSaveRef.current) {
        const pending = pendingSaveRef.current;
        pendingSaveRef.current = null;
        saveWorkout(pending.key, pending.data);
      }
    }
  };

  const deleteWorkout = (key: string) => {
    // Extract phase, week, workoutNum from key
    const [phase, week, workoutNum] = key.split('-').map(Number);

    // Delete from localStorage immediately
    setWorkoutLog(prev => {
      const newLog = { ...prev };
      delete newLog[key];
      return newLog;
    });

    // Delete from API in background
    api.deleteWorkoutLog(phase, week, workoutNum).catch(error => {
      console.error('Error deleting from API:', error);
      setSyncError('Failed to sync with server');
    });
  };

  const getWorkout = (key: string): WorkoutLogEntry | undefined => workoutLog[key];

  const hasWeekData = (phase: number, week: number): boolean => {
    for (let workout = 1; workout <= 5; workout++) {
      if (workoutLog[`${phase}-${week}-${workout}`]) return true;
    }
    return false;
  };

  const refreshFromApi = async () => {
    try {
      const logs = await api.getWorkoutLogs();

      // Convert API logs to WorkoutLog format
      const apiLogs: WorkoutLog = {};
      for (const log of logs) {
        const key = `${log.phase}-${log.week}-${log.workoutNum}`;

        // Fetch full workout details
        const fullLog = await api.getWorkoutLog(log.phase, log.week, log.workoutNum);
        if (fullLog) {
          apiLogs[key] = {
            phase: fullLog.phase,
            week: fullLog.week,
            workoutNum: fullLog.workoutNum,
            workoutName: fullLog.workoutName,
            focus: fullLog.focus,
            exercises: fullLog.exercises.map(exercise => ({
              name: exercise.exerciseName,
              targetSets: exercise.targetSets,
              targetReps: exercise.targetReps,
              sets: exercise.sets.map(set => ({
                weight: set.weight || '',
                reps: set.reps || '',
              })),
              notes: exercise.notes || '',
            })),
            savedAt: fullLog.updatedAt,
            completed: fullLog.completed,
            completedAt: fullLog.completedAt,
          };
        }
      }

      // Replace state with API data
      setWorkoutLog(apiLogs);
      setSyncError(null);
    } catch (error) {
      console.error('Error refreshing from API:', error);
      setSyncError('Failed to sync with server');
    }
  };

  return {
    workoutLog,
    saveWorkout,
    deleteWorkout,
    getWorkout,
    hasWeekData,
    isLoading,
    syncError,
    refreshFromApi,
  };
}
