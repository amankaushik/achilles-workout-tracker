-- Apply the same simple policy to ALL tables for temp user development
-- This ensures no RLS issues with unauthenticated access

-- ========================================
-- EXERCISE_LOGS
-- ========================================
DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;

CREATE POLICY "Allow exercise_logs operations" ON exercise_logs
  FOR ALL
  USING (
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- ========================================
-- SET_LOGS
-- ========================================
DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
DROP POLICY IF EXISTS "Allow set_logs operations" ON set_logs;
DROP POLICY IF EXISTS "Temp user can manage all set logs" ON set_logs;

CREATE POLICY "Allow set_logs operations" ON set_logs
  FOR ALL
  USING (
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- ========================================
-- WORKOUT_LOGS
-- ========================================
DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;

CREATE POLICY "Allow workout_logs operations" ON workout_logs
  FOR ALL
  USING (
    auth.uid() IS NULL
    OR user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NULL
    OR user_id = auth.uid()
  );

-- ========================================
-- USERS
-- ========================================
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Allow users operations" ON users
  FOR ALL
  USING (
    auth.uid() IS NULL
    OR id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NULL
    OR id = auth.uid()
  );
