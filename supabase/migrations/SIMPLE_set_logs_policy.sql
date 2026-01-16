-- Ultra-simple policy for set_logs that just allows all operations
-- for unauthenticated users (temp user development)
-- This avoids complex JOINs that might have timing issues

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
DROP POLICY IF EXISTS "Temp user can manage all set logs" ON set_logs;

-- Create a single permissive policy
-- Allow all operations when there's no auth.uid() (unauthenticated = temp user)
-- For real users (future), check if they own the related workout
CREATE POLICY "Allow set_logs operations" ON set_logs
  FOR ALL
  USING (
    -- Allow if unauthenticated (temp user)
    auth.uid() IS NULL
    -- OR if authenticated and owns the workout
    OR EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Same check for INSERT
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );
