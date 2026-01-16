-- Complete setup for temp user and RLS policies
-- Run this AFTER running 001_initial_schema.sql and 002_seed_exercises.sql
-- This replaces migrations 003 and 004

-- Step 1: Temporarily disable RLS to insert temp user
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

INSERT INTO users (id, email, name)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'temp@achilles.local',
  'Temporary User'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow temp user access" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Allow temp user workout logs" ON workout_logs;

DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Allow temp user exercise logs" ON exercise_logs;

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;
DROP POLICY IF EXISTS "Allow temp user set logs" ON set_logs;

-- Step 3: Create new policies that work for both auth users and temp user

-- USERS
CREATE POLICY "Users can view own data" ON users FOR SELECT
  USING (auth.uid() = id OR id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update own data" ON users FOR UPDATE
  USING (auth.uid() = id OR id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert own data" ON users FOR INSERT
  WITH CHECK (auth.uid() = id OR id = '00000000-0000-0000-0000-000000000000'::uuid);

-- WORKOUT_LOGS
CREATE POLICY "Users can view own workout logs" ON workout_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert own workout logs" ON workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update own workout logs" ON workout_logs FOR UPDATE
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete own workout logs" ON workout_logs FOR DELETE
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- EXERCISE_LOGS
CREATE POLICY "Users can view own exercise logs" ON exercise_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

CREATE POLICY "Users can insert own exercise logs" ON exercise_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

CREATE POLICY "Users can update own exercise logs" ON exercise_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

CREATE POLICY "Users can delete own exercise logs" ON exercise_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

-- SET_LOGS
CREATE POLICY "Users can view own set logs" ON set_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

CREATE POLICY "Users can insert own set logs" ON set_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

CREATE POLICY "Users can update own set logs" ON set_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );

CREATE POLICY "Users can delete own set logs" ON set_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND (workout_logs.user_id = auth.uid() OR workout_logs.user_id = '00000000-0000-0000-0000-000000000000'::uuid)
    )
  );
