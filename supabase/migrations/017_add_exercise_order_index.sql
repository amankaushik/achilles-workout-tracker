-- Add composite indexes for query optimization
-- This improves performance when fetching exercises and sets for workouts

-- ============================================
-- Add composite index for exercise_logs queries
-- ============================================

-- This index optimizes queries that filter by workout_log_id and sort by exercise_order
-- Used in getWorkoutLog() function to fetch exercises in correct order
CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout_order
  ON exercise_logs(workout_log_id, exercise_order);

-- ============================================
-- Add composite index for set_logs queries
-- ============================================

-- This index optimizes queries that filter by exercise_log_id and sort by set_number
-- Used when fetching sets for each exercise in correct order
CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_order
  ON set_logs(exercise_log_id, set_number);

-- ============================================
-- Summary:
-- ============================================
-- 1. idx_exercise_logs_workout_order optimizes:
--    SELECT * FROM exercise_logs WHERE workout_log_id = ? ORDER BY exercise_order
--
-- 2. idx_set_logs_exercise_order optimizes:
--    SELECT * FROM set_logs WHERE exercise_log_id = ? ORDER BY set_number
--
-- Benefits:
-- - Faster data retrieval when viewing workouts
-- - Efficient sorting without additional sort operations
-- - Both indexes cover their respective WHERE and ORDER BY clauses
