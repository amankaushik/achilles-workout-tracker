import { supabase } from '../lib/supabase';
import {
  Exercise,
  WorkoutLogDB,
  WorkoutLogFull,
  CreateWorkoutLogRequest,
} from '../types/database';

/**
 * Get the current authenticated user ID from Supabase Auth
 * Uses auth.users table managed by Supabase, no custom users table needed
 */
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No authenticated user');
  }

  return user.id;
}

/**
 * Get exercise ID by name, returns null if not found
 */
async function getExerciseId(exerciseName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id')
    .eq('name', exerciseName)
    .single();

  if (error) {
    console.warn(`Exercise not found: ${exerciseName}`);
    return null;
  }

  return data.id;
}

/**
 * Save or update a workout log with exercises and sets
 */
export async function saveWorkoutLog(
  request: CreateWorkoutLogRequest
): Promise<WorkoutLogDB> {
  const userId = await getCurrentUserId();

  // Check if workout log already exists
  const { data: existingLog } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('phase', request.phase)
    .eq('week', request.week)
    .eq('workout_num', request.workoutNum)
    .single();

  let workoutLogId: string;

  if (existingLog) {
    // Update existing workout log
    const { data: updatedLog, error: updateError } = await supabase
      .from('workout_logs')
      .update({
        workout_name: request.workoutName,
        focus: request.focus,
        completed: request.completed,
        completed_at: request.completedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingLog.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating workout log:', updateError);
      throw new Error('Failed to update workout log');
    }

    workoutLogId = updatedLog.id;

    // Delete existing exercise logs (cascade will delete sets)
    await supabase
      .from('exercise_logs')
      .delete()
      .eq('workout_log_id', workoutLogId);
  } else {
    // Create new workout log
    const { data: newLog, error: insertError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        phase: request.phase,
        week: request.week,
        workout_num: request.workoutNum,
        workout_name: request.workoutName,
        focus: request.focus,
        completed: request.completed,
        completed_at: request.completedAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating workout log:', insertError);
      throw new Error('Failed to create workout log');
    }

    workoutLogId = newLog.id;
  }

  // Insert exercise logs
  const errors = [];
  for (const exercise of request.exercises) {
    try {
      const exerciseId = await getExerciseId(exercise.exerciseName);

      const { data: exerciseLog, error: exerciseError } = await supabase
        .from('exercise_logs')
        .insert({
          workout_log_id: workoutLogId,
          exercise_id: exerciseId,
          exercise_name: exercise.exerciseName,
          exercise_order: exercise.exerciseOrder,
          target_sets: exercise.targetSets,
          target_reps: exercise.targetReps,
          notes: exercise.notes || null,
        })
        .select()
        .single();

      if (exerciseError) {
        console.error(`Error creating exercise log for "${exercise.exerciseName}":`, exerciseError);
        errors.push(`Failed to save exercise: ${exercise.exerciseName}`);
        continue; // Skip to next exercise instead of throwing
      }

      // Insert set logs
      if (exercise.sets && exercise.sets.length > 0) {
        const setLogs = exercise.sets.map((set) => ({
          exercise_log_id: exerciseLog.id,
          workout_log_id: workoutLogId,
          set_number: set.setNumber,
          weight: set.weight || null,
          reps: set.reps || null,
        }));

        const { error: setsError } = await supabase
          .from('set_logs')
          .insert(setLogs);

        if (setsError) {
          console.error(`Error creating set logs for "${exercise.exerciseName}":`, setsError);
          errors.push(`Failed to save sets for: ${exercise.exerciseName}`);
          // Continue anyway - exercise is saved even if sets aren't
        }
      }
    } catch (error) {
      console.error(`Unexpected error saving exercise "${exercise.exerciseName}":`, error);
      errors.push(`Error with exercise: ${exercise.exerciseName}`);
    }
  }

  // Log errors but don't throw - partial saves are better than no saves
  if (errors.length > 0) {
    console.warn('Some exercises failed to save:', errors);
  }

  // Fetch and return the complete workout log
  const { data: finalLog, error: fetchError } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('id', workoutLogId)
    .single();

  if (fetchError) {
    console.error('Error fetching workout log:', fetchError);
    throw new Error('Failed to fetch workout log');
  }

  return {
    id: finalLog.id,
    userId: finalLog.user_id,
    phase: finalLog.phase,
    week: finalLog.week,
    workoutNum: finalLog.workout_num,
    workoutName: finalLog.workout_name,
    focus: finalLog.focus,
    completed: finalLog.completed,
    completedAt: finalLog.completed_at,
    createdAt: finalLog.created_at,
    updatedAt: finalLog.updated_at,
  };
}

/**
 * Get all workout logs for the current user
 */
export async function getWorkoutLogs(): Promise<WorkoutLogDB[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workout logs:', error);
    throw new Error('Failed to fetch workout logs');
  }

  return data.map((log) => ({
    id: log.id,
    userId: log.user_id,
    phase: log.phase,
    week: log.week,
    workoutNum: log.workout_num,
    workoutName: log.workout_name,
    focus: log.focus,
    completed: log.completed,
    completedAt: log.completed_at,
    createdAt: log.created_at,
    updatedAt: log.updated_at,
  }));
}

/**
 * Get a specific workout log with all exercises and sets
 */
export async function getWorkoutLog(
  phase: number,
  week: number,
  workoutNum: number
): Promise<WorkoutLogFull | null> {
  const userId = await getCurrentUserId();

  const { data: workoutLog, error: logError } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('phase', phase)
    .eq('week', week)
    .eq('workout_num', workoutNum)
    .single();

  if (logError || !workoutLog) {
    return null;
  }

  // Fetch exercise logs
  const { data: exerciseLogs, error: exerciseError } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('workout_log_id', workoutLog.id)
    .order('exercise_order', { ascending: true });

  if (exerciseError) {
    console.error('Error fetching exercise logs:', exerciseError);
    throw new Error('Failed to fetch exercise logs');
  }

  // Fetch set logs for each exercise
  const exercisesWithSets = await Promise.all(
    exerciseLogs.map(async (exerciseLog) => {
      const { data: setLogs, error: setsError } = await supabase
        .from('set_logs')
        .select('*')
        .eq('exercise_log_id', exerciseLog.id)
        .order('set_number', { ascending: true });

      if (setsError) {
        console.error('Error fetching set logs:', setsError);
        throw new Error('Failed to fetch set logs');
      }

      return {
        id: exerciseLog.id,
        workoutLogId: exerciseLog.workout_log_id,
        exerciseId: exerciseLog.exercise_id,
        exerciseName: exerciseLog.exercise_name,
        exerciseOrder: exerciseLog.exercise_order,
        targetSets: exerciseLog.target_sets,
        targetReps: exerciseLog.target_reps,
        notes: exerciseLog.notes,
        createdAt: exerciseLog.created_at,
        updatedAt: exerciseLog.updated_at,
        sets: setLogs.map((set) => ({
          id: set.id,
          exerciseLogId: set.exercise_log_id,
          workoutLogId: set.workout_log_id,
          setNumber: set.set_number,
          weight: set.weight,
          reps: set.reps,
          createdAt: set.created_at,
          updatedAt: set.updated_at,
        })),
      };
    })
  );

  return {
    id: workoutLog.id,
    userId: workoutLog.user_id,
    phase: workoutLog.phase,
    week: workoutLog.week,
    workoutNum: workoutLog.workout_num,
    workoutName: workoutLog.workout_name,
    focus: workoutLog.focus,
    completed: workoutLog.completed,
    completedAt: workoutLog.completed_at,
    createdAt: workoutLog.created_at,
    updatedAt: workoutLog.updated_at,
    exercises: exercisesWithSets,
  };
}

/**
 * Delete a workout log
 */
export async function deleteWorkoutLog(
  phase: number,
  week: number,
  workoutNum: number
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('user_id', userId)
    .eq('phase', phase)
    .eq('week', week)
    .eq('workout_num', workoutNum);

  if (error) {
    console.error('Error deleting workout log:', error);
    throw new Error('Failed to delete workout log');
  }
}

/**
 * Get all exercises
 */
export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching exercises:', error);
    throw new Error('Failed to fetch exercises');
  }

  return data.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    muscleGroups: exercise.muscle_groups,
    equipment: exercise.equipment,
    createdAt: exercise.created_at,
  }));
}
