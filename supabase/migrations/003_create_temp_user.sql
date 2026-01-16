-- Create temporary user for development (bypasses RLS)
-- Run this in the SQL Editor with RLS disabled

-- Temporarily disable RLS to insert temp user
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert temp user
INSERT INTO users (id, email, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'temp@achilles.local',
  'Temporary User',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add a special policy to allow the temp user to access their own data even without auth
CREATE POLICY "Allow temp user access"
  ON users FOR ALL
  USING (id = '00000000-0000-0000-0000-000000000000');

-- Add similar policy for workout_logs
CREATE POLICY "Allow temp user workout logs"
  ON workout_logs FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000000')
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

-- Add similar policy for exercise_logs (cascade from workout_logs)
CREATE POLICY "Allow temp user exercise logs"
  ON exercise_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = '00000000-0000-0000-0000-000000000000'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_logs
      WHERE workout_logs.id = exercise_logs.workout_log_id
      AND workout_logs.user_id = '00000000-0000-0000-0000-000000000000'
    )
  );

-- Add similar policy for set_logs (cascade from exercise_logs)
CREATE POLICY "Allow temp user set logs"
  ON set_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = '00000000-0000-0000-0000-000000000000'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercise_logs
      JOIN workout_logs ON workout_logs.id = exercise_logs.workout_log_id
      WHERE exercise_logs.id = set_logs.exercise_log_id
      AND workout_logs.user_id = '00000000-0000-0000-0000-000000000000'
    )
  );
