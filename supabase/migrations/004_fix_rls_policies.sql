-- Fix RLS policies to work with both authenticated users and temp user
-- Drop old policies and recreate with support for temp user

-- ========================================
-- USERS TABLE
-- ========================================

DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow temp user access" ON users;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (
    auth.uid() = id
    OR id = '00000000-0000-0000-0000-000000000000'
  );

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (
    auth.uid() = id
    OR id = '00000000-0000-0000-0000-000000000000'
  );

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR id = '00000000-0000-0000-0000-000000000000'
  );

-- ========================================
-- WORKOUT_LOGS TABLE
-- ========================================

DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Allow temp user workout logs" ON workout_logs;

CREATE POLICY "Users can view own workout logs"
  ON workout_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id = '00000000-0000-0000-0000-000000000000'
  );

CREATE POLICY "Users can insert own workout logs"
  ON workout_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id = '00000000-0000-0000-0000-000000000000'
  );

CREATE POLICY "Users can update own workout logs"
  ON workout_logs FOR UPDATE
  USING (
    auth.uid() = user_id
    OR user_id = '00000000-0000-0000-0000-000000000000'
  );

CREATE POLICY "Users can delete own workout logs"
  ON workout_logs FOR DELETE
  USING (
    auth.uid() = user_id
    OR user_id = '00000000-0000-0000-0000-000000000000'
  );

-- ========================================
-- EXERCISE_LOGS TABLE
-- ========================================

DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Allow temp user exercise logs" ON exercise_logs;

CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );

CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );

CREATE POLICY "Users can update own exercise logs"
  ON exercise_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );

CREATE POLICY "Users can delete own exercise logs"
  ON exercise_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-000000000000')
    )
  );

-- ========================================
-- SET_LOGS TABLE
-- ========================================

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
DROP POLICY IF EXISTS "Allow temp user set logs" ON set_logs;

CREATE POLICY "Users can view own set logs"
  ON set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );

CREATE POLICY "Users can insert own set logs"
  ON set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );

CREATE POLICY "Users can update own set logs"
  ON set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );

CREATE POLICY "Users can delete own set logs"
  ON set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000')
    )
  );
