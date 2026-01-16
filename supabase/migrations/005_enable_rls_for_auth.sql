-- Re-enable RLS for authenticated users
-- Run this AFTER enabling authentication

-- Re-enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow users operations" ON users;

DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Allow workout_logs operations" ON workout_logs;

DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Allow exercise_logs operations" ON exercise_logs;

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
DROP POLICY IF EXISTS "Allow set_logs operations" ON set_logs;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================
-- WORKOUT_LOGS TABLE POLICIES
-- ========================================

CREATE POLICY "Users can view own workout logs" ON workout_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" ON workout_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON workout_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" ON workout_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- EXERCISE_LOGS TABLE POLICIES
-- ========================================

CREATE POLICY "Users can view own exercise logs" ON exercise_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercise logs" ON exercise_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercise logs" ON exercise_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercise logs" ON exercise_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- ========================================
-- SET_LOGS TABLE POLICIES
-- ========================================

CREATE POLICY "Users can view own set logs" ON set_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own set logs" ON set_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own set logs" ON set_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own set logs" ON set_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      INNER JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );
