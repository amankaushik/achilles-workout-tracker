 hav-- Add unique constraints and direct workout_log_id reference to set_logs
-- This prevents duplicate exercises and sets, and simplifies queries

-- Step 1: Add unique constraint to exercise_logs
-- Ensures one exercise_id can only appear once per workout_log
ALTER TABLE exercise_logs
  ADD CONSTRAINT exercise_logs_workout_exercise_unique
  UNIQUE (workout_log_id, exercise_id);

-- Step 2: Add workout_log_id column to set_logs
-- This creates a direct link from sets to workouts
ALTER TABLE set_logs
  ADD COLUMN IF NOT EXISTS workout_log_id UUID;

-- Step 3: Populate workout_log_id for existing records
UPDATE set_logs
SET workout_log_id = exercise_logs.workout_log_id
FROM exercise_logs
WHERE set_logs.exercise_log_id = exercise_logs.id
AND set_logs.workout_log_id IS NULL;

-- Step 4: Make workout_log_id NOT NULL and add foreign key
ALTER TABLE set_logs
  ALTER COLUMN workout_log_id SET NOT NULL;

ALTER TABLE set_logs
  ADD CONSTRAINT set_logs_workout_log_id_fkey
  FOREIGN KEY (workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE;

-- Step 5: Add index on workout_log_id for better query performance
CREATE INDEX IF NOT EXISTS idx_set_logs_workout ON set_logs(workout_log_id);

-- Step 6: Add unique constraint to set_logs
-- Ensures set_number is unique within each exercise_log
ALTER TABLE set_logs
  ADD CONSTRAINT set_logs_exercise_set_unique
  UNIQUE (exercise_log_id, set_number);

-- Benefits:
-- 1. Prevents duplicate exercises in same workout (exercise_logs unique constraint)
-- 2. Prevents duplicate set numbers for same exercise (set_logs unique constraint)
-- 3. Direct workout_log reference in set_logs simplifies queries
-- 4. Cascade deletes work from workout_logs -> set_logs directly
