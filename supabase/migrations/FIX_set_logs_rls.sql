-- Fix set_logs RLS policies - use simpler approach for temp user
-- The complex nested queries are causing issues, so we'll create separate simple policies

-- Drop all existing set_logs policies
DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;

-- Approach: Create very permissive policies for temp user development
-- For authenticated users (future), we'll rely on proper auth checks

-- Allow all operations on set_logs that belong to temp user's exercise_logs
-- This is simpler and avoids transaction/timing issues
CREATE POLICY "Temp user can manage all set logs" ON set_logs
  FOR ALL
  USING (
    -- For SELECT/UPDATE/DELETE, check if the related workout belongs to temp user
    EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
    -- OR allow if there's a valid auth.uid() (for future real users)
    OR EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- For INSERT, check if the exercise_log we're adding to belongs to temp user
    EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
    -- OR allow if there's a valid auth.uid() (for future real users)
    OR EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );
