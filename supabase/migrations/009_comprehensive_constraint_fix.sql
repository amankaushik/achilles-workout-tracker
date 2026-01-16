-- Comprehensive fix for all constraint and RLS issues
-- This migration cleans up incorrect constraints and ensures proper RLS policies

-- ============================================
-- PART 1: Fix exercise_logs constraints
-- ============================================

-- Drop ALL incorrect unique constraints on exercise_logs
ALTER TABLE exercise_logs
  DROP CONSTRAINT IF EXISTS exercise_logs_exercise_id_key;

ALTER TABLE exercise_logs
  DROP CONSTRAINT IF EXISTS exercise_logs_workout_log_id_key;

-- Ensure the CORRECT constraint exists: (workout_log_id, exercise_id)
-- This allows multiple exercises per workout, but prevents duplicate exercises
ALTER TABLE exercise_logs
  DROP CONSTRAINT IF EXISTS exercise_logs_workout_exercise_unique;

ALTER TABLE exercise_logs
  ADD CONSTRAINT exercise_logs_workout_exercise_unique
  UNIQUE (workout_log_id, exercise_id);

-- ============================================
-- PART 2: Fix set_logs constraints
-- ============================================

-- Ensure workout_log_id exists and has foreign key
ALTER TABLE set_logs
  ADD COLUMN IF NOT EXISTS workout_log_id UUID;

-- Populate workout_log_id if any records exist without it
UPDATE set_logs
SET workout_log_id = exercise_logs.workout_log_id
FROM exercise_logs
WHERE set_logs.exercise_log_id = exercise_logs.id
AND set_logs.workout_log_id IS NULL;

-- Make NOT NULL if not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'set_logs'
    AND column_name = 'workout_log_id'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE set_logs ALTER COLUMN workout_log_id SET NOT NULL;
  END IF;
END $$;

-- Add foreign key if not exists
ALTER TABLE set_logs
  DROP CONSTRAINT IF EXISTS set_logs_workout_log_id_fkey;

ALTER TABLE set_logs
  ADD CONSTRAINT set_logs_workout_log_id_fkey
  FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE;

-- Ensure correct unique constraint on set_logs
ALTER TABLE set_logs
  DROP CONSTRAINT IF EXISTS set_logs_exercise_set_unique;

ALTER TABLE set_logs
  ADD CONSTRAINT set_logs_exercise_set_unique
  UNIQUE (workout_log_id, exercise_log_id, set_number);

-- ============================================
-- PART 3: Fix RLS policies for authenticated users
-- ============================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON workout_logs;

DROP POLICY IF EXISTS "Users can view own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can insert own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can update own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can delete own exercise logs" ON exercise_logs;

DROP POLICY IF EXISTS "Users can view own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can insert own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can update own set logs" ON set_logs;
DROP POLICY IF EXISTS "Users can delete own set logs" ON set_logs;

DROP POLICY IF EXISTS "Everyone can read exercises" ON exercises;

-- Re-enable RLS on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;

-- Exercises: Anyone can read (public reference data)
CREATE POLICY "Everyone can read exercises" ON exercises
  FOR SELECT
  USING (true);

-- Workout logs: Users can manage their own logs
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

-- Exercise logs: Users can manage exercise logs for their own workouts
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

-- Set logs: Users can manage set logs for their own workouts
CREATE POLICY "Users can view own set logs" ON set_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own set logs" ON set_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own set logs" ON set_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own set logs" ON set_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = set_logs.workout_log_id
      AND workout_logs.user_id = auth.uid()
    )
  );

-- ============================================
-- Summary of changes:
-- ============================================
-- 1. Removed bad constraints:
--    - exercise_logs_exercise_id_key (only checked exercise_id)
--    - exercise_logs_workout_log_id_key (only checked workout_log_id)
--
-- 2. Ensured correct constraints:
--    - exercise_logs: UNIQUE(workout_log_id, exercise_id)
--    - set_logs: UNIQUE(workout_log_id, exercise_log_id, set_number)
--
-- 3. Fixed RLS policies to use workout_log_id for set_logs and exercise_logs
--    instead of joining through exercise_logs for better performance
