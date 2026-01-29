import { supabase } from '../lib/supabase';
import {
  Exercise,
  Program,
  Session,
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
  sessionId: string,
  request: CreateWorkoutLogRequest
): Promise<WorkoutLogDB> {
  const userId = await getCurrentUserId();

  // Check if workout log already exists
  const { data: existingLog } = await supabase
    .from('workout_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
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

    // Note: We use UPSERT for exercise_logs below, so no need to delete first
  } else {
    // Create new workout log
    const { data: newLog, error: insertError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: userId,
        session_id: sessionId,
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

  // Upsert exercise logs (insert or update if exists)
  const errors = [];
  for (const exercise of request.exercises) {
    try {
      const exerciseId = await getExerciseId(exercise.exerciseName);

      // Use upsert to handle both insert and update
      const { data: exerciseLog, error: exerciseError } = await supabase
        .from('exercise_logs')
        .upsert({
          workout_log_id: workoutLogId,
          exercise_id: exerciseId,
          exercise_name: exercise.exerciseName,
          exercise_order: exercise.exerciseOrder,
          target_sets: exercise.targetSets,
          target_reps: exercise.targetReps,
          notes: exercise.notes || null,
        }, {
          onConflict: 'workout_log_id,exercise_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (exerciseError) {
        console.error(`Error upserting exercise log for "${exercise.exerciseName}":`, exerciseError);
        errors.push(`Failed to save exercise: ${exercise.exerciseName}`);
        continue; // Skip to next exercise instead of throwing
      }

      // Delete existing sets for this exercise and insert new ones
      if (exercise.sets && exercise.sets.length > 0) {
        // Delete old sets first
        await supabase
          .from('set_logs')
          .delete()
          .eq('exercise_log_id', exerciseLog.id);

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
    sessionId: finalLog.session_id,
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
 * Get workout logs for the current user and session
 * @param sessionId - The session ID to filter by
 * @param limit - Optional limit on number of results (defaults to all)
 */
export async function getWorkoutLogs(sessionId: string, limit?: number): Promise<WorkoutLogDB[]> {
  const userId = await getCurrentUserId();

  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching workout logs:', error);
    throw new Error('Failed to fetch workout logs');
  }

  return data.map((log) => ({
    id: log.id,
    userId: log.user_id,
    sessionId: log.session_id,
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
  sessionId: string,
  phase: number,
  week: number,
  workoutNum: number
): Promise<WorkoutLogFull | null> {
  const userId = await getCurrentUserId();

  const { data: workoutLog, error: logError } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
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
    sessionId: workoutLog.session_id,
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
  sessionId: string,
  phase: number,
  week: number,
  workoutNum: number
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId)
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

// ============================================
// Session Management Functions
// ============================================

/**
 * Get all sessions for the current user
 */
export async function getSessions(): Promise<Session[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    throw new Error('Failed to fetch sessions');
  }

  if (!data) {
    return [];
  }

  return data.map((session) => ({
    id: session.id,
    userId: session.user_id,
    programId: session.program_id,
    name: session.name,
    description: session.description,
    isActive: session.is_active,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  }));
}

/**
 * Get the active session for the current user
 */
export async function getActiveSession(): Promise<Session | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    programId: data.program_id,
    name: data.name,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Create a new session
 */
export async function createSession(
  programId: string,
  name: string,
  description?: string,
  makeActive: boolean = false
): Promise<Session> {
  const userId = await getCurrentUserId();

  // If makeActive is true, deactivate all other sessions first
  if (makeActive) {
    const { error: deactivateError } = await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Error deactivating sessions:', deactivateError);
      // Continue anyway - the insert might still work
    }
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      program_id: programId,
      name,
      description: description || null,
      is_active: makeActive,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }

  return {
    id: data.id,
    userId: data.user_id,
    programId: data.program_id,
    name: data.name,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Create default session for a new user with the Achilles Program
 */
export async function createDefaultSession(): Promise<Session> {
  // Get the Achilles Program ID
  const { data: achillesProgram } = await supabase
    .from('programs')
    .select('id')
    .eq('name', 'Achilles Program')
    .eq('is_system', true)
    .single();

  if (!achillesProgram) {
    throw new Error('Achilles Program not found');
  }

  return createSession(
    achillesProgram.id,
    'Default Session',
    'Your first training session',
    true
  );
}

/**
 * Update a session (for renaming)
 */
export async function updateSession(
  sessionId: string,
  updates: { name?: string; description?: string }
): Promise<Session> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('sessions')
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId) // Ensure user owns this session
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw new Error('Failed to update session');
  }

  return {
    id: data.id,
    userId: data.user_id,
    programId: data.program_id,
    name: data.name,
    description: data.description,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Set a session as active (and deactivate all others)
 */
export async function setActiveSession(sessionId: string): Promise<void> {
  const userId = await getCurrentUserId();

  // Deactivate all sessions for this user
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('user_id', userId);

  // Activate the specified session
  const { error } = await supabase
    .from('sessions')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error setting active session:', error);
    throw new Error('Failed to set active session');
  }
}

/**
 * Delete a session (and all its workout logs via CASCADE)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting session:', error);
    throw new Error('Failed to delete session');
  }
}

// ============================================
// Program Management Functions
// ============================================

/**
 * Get all available programs (system programs + user's custom programs)
 */
export async function getPrograms(): Promise<Program[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .or(`is_system.eq.true,created_by.eq.${userId}`)
    .order('is_system', { ascending: false }) // System programs first
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching programs:', error);
    throw new Error('Failed to fetch programs');
  }

  if (!data) {
    return [];
  }

  return data.map((program) => ({
    id: program.id,
    name: program.name,
    description: program.description,
    structure: program.structure,
    createdBy: program.created_by,
    isSystem: program.is_system,
    createdAt: program.created_at,
    updatedAt: program.updated_at,
  }));
}

/**
 * Get a specific program by ID
 */
export async function getProgram(programId: string): Promise<Program | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .or(`is_system.eq.true,created_by.eq.${userId}`)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    structure: data.structure,
    createdBy: data.created_by,
    isSystem: data.is_system,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Create a custom program (for future use)
 */
export async function createProgram(
  name: string,
  description: string,
  structure: Record<string, any>
): Promise<Program> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('programs')
    .insert({
      name,
      description,
      structure,
      created_by: userId,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating program:', error);
    throw new Error('Failed to create program');
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    structure: data.structure,
    createdBy: data.created_by,
    isSystem: data.is_system,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
