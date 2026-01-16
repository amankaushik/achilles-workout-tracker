-- Fix exercise_logs unique constraint
-- The old constraint "exercise_logs_workout_log_id_key" only allows one exercise per workout
-- The correct constraint should be on (workout_log_id, exercise_id) to allow multiple exercises

-- Drop the incorrect constraint that only checks workout_log_id
ALTER TABLE exercise_logs
  DROP CONSTRAINT IF EXISTS exercise_logs_workout_log_id_key;

-- Ensure the correct constraint exists (workout_log_id + exercise_id)
-- This allows multiple exercises per workout, but prevents duplicate exercises
ALTER TABLE exercise_logs
  DROP CONSTRAINT IF EXISTS exercise_logs_workout_exercise_unique;

ALTER TABLE exercise_logs
  ADD CONSTRAINT exercise_logs_workout_exercise_unique
  UNIQUE (workout_log_id, exercise_id);
